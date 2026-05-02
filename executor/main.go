package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
)

type ExecuteRequest struct {
	Code        string `json:"code"`
	Language    string `json:"language"` // "cpp" or "python"
	Input       string `json:"input"`
	TimeLimit   int    `json:"timeLimit"`   // ms
	MemoryLimit int    `json:"memoryLimit"` // MB
}

type ExecuteResponse struct {
	Status   string `json:"status"` // "success", "tle", "re", "ce"
	Output   string `json:"output"`
	Error    string `json:"error"`
	Runtime  int    `json:"runtime"` // ms
	ExitCode int    `json:"exitCode"`
}

var dockerClient *client.Client

func init() {
	var err error
	dockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("Failed to initialize Docker client: %v", err)
	}
}

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Go Execution Service is running. Use POST /execute to run code.")
	})
	http.HandleFunc("/execute", executeHandler)
	port := "8080"
	log.Printf("-----------------------------------------")
	log.Printf("🚀 Go Execution Service started on port %s", port)
	log.Printf("📡 Endpoint: http://localhost:%s/execute", port)
	log.Printf("-----------------------------------------")
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func executeHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST is allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ExecuteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	resp := processExecution(req)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func processExecution(req ExecuteRequest) ExecuteResponse {
	// 1. Create temporary directory
	sandboxRoot := "./.sandbox"
	err := os.MkdirAll(sandboxRoot, 0777)
	if err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to create sandbox dir", ExitCode: -1}
	}
	tmpDir, err := os.MkdirTemp(sandboxRoot, "sub-*")
	if err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to create temp directory", ExitCode: -1}
	}
	defer os.RemoveAll(tmpDir) // Cleanup

	absPath, err := filepath.Abs(tmpDir)
	if err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to get absolute path", ExitCode: -1}
	}

	// 2. Write code and input
	var codeFileName string
	if req.Language == "cpp" {
		codeFileName = "solution.cpp"
	} else if req.Language == "python" {
		codeFileName = "solution.py"
	} else {
		return ExecuteResponse{Status: "re", Error: "Unsupported language", ExitCode: -1}
	}

	codePath := filepath.Join(tmpDir, codeFileName)
	if err := os.WriteFile(codePath, []byte(req.Code), 0644); err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to write code", ExitCode: -1}
	}

	inputPath := filepath.Join(tmpDir, "input.txt")
	if err := os.WriteFile(inputPath, []byte(req.Input), 0644); err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to write input", ExitCode: -1}
	}

	// 3. Prepare command
	var image string
	var cmd []string

	if req.Language == "cpp" {
		image = "gcc:latest"
		// Compile and run inside the container to ensure binary compatibility
		cmd = []string{"sh", "-c", "g++ -O3 solution.cpp -o solution && ./solution < input.txt"}
	} else {
		image = "python:3.10-slim"
		cmd = []string{"sh", "-c", "python3 solution.py < input.txt"}
	}

	// 4. Execute in Docker
	return runInDocker(req, absPath, image, cmd)
}

func runInDocker(req ExecuteRequest, tmpDir string, image string, cmd []string) ExecuteResponse {
	ctx := context.Background()

	// Ensure image exists (in a real system, you'd pull it if missing, here we assume it's available or we pull it)
	// For simplicity, we assume the host has the images or we pull them here.
	// dockerClient.ImagePull(ctx, image, types.ImagePullOptions{})

	hostConfig := &container.HostConfig{
		Mounts: []mount.Mount{
			{
				Type:   mount.TypeBind,
				Source: tmpDir,
				Target: "/app",
			},
		},
		Resources: container.Resources{
			Memory:   int64(req.MemoryLimit) * 1024 * 1024,
			NanoCPUs: int64(0.5 * 1e9), // 0.5 CPU
		},
		NetworkMode: "none",
	}

	resp, err := dockerClient.ContainerCreate(ctx, &container.Config{
		Image:      image,
		Cmd:        cmd,
		WorkingDir: "/app",
	}, hostConfig, nil, nil, "")

	if err != nil {
		return ExecuteResponse{Status: "re", Error: fmt.Sprintf("Docker create failed: %v", err), ExitCode: -1}
	}

	containerID := resp.ID
	defer dockerClient.ContainerRemove(context.Background(), containerID, container.RemoveOptions{Force: true})

	// Start timer
	startTime := time.Now()

	if err := dockerClient.ContainerStart(ctx, containerID, container.StartOptions{}); err != nil {
		return ExecuteResponse{Status: "re", Error: fmt.Sprintf("Docker start failed: %v", err), ExitCode: -1}
	}

	// Wait for completion with timeout
	// For C++, we add a 5-second buffer for compilation
	executionTimeout := req.TimeLimit
	if req.Language == "cpp" {
		executionTimeout += 5000
	}
	timeoutCtx, cancel := context.WithTimeout(ctx, time.Duration(executionTimeout)*time.Millisecond)
	defer cancel()

	statusCh, errCh := dockerClient.ContainerWait(timeoutCtx, containerID, container.WaitConditionNotRunning)
	
	var exitCode int
	select {
	case err := <-errCh:
		if err != nil {
			return ExecuteResponse{Status: "re", Error: err.Error(), ExitCode: -1}
		}
	case status := <-statusCh:
		exitCode = int(status.StatusCode)
	case <-timeoutCtx.Done():
		return ExecuteResponse{Status: "tle", Runtime: req.TimeLimit, ExitCode: -1}
	}

	runtime := int(time.Since(startTime).Milliseconds())

	// Get logs
	out, err := dockerClient.ContainerLogs(ctx, containerID, container.LogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		return ExecuteResponse{Status: "re", Error: "Failed to get logs", ExitCode: -1}
	}
	defer out.Close()

	var stdout, stderr bytes.Buffer
	stdcopy.StdCopy(&stdout, &stderr, out)

	status := "success"
	if exitCode != 0 {
		status = "re"
	}

	return ExecuteResponse{
		Status:   status,
		Output:   stdout.String(),
		Error:    stderr.String(),
		Runtime:  runtime,
		ExitCode: exitCode,
	}
}
