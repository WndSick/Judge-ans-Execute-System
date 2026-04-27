# FINAL Distributed Execution System Design (Node Worker + Go Service)

This is the locked, implementation-ready design for the LeetCode-style code execution and judging system. This design is final and serves as the absolute blueprint for all development.

---

## 1. Final Architecture & Responsibilities

### **System Components**
- **Node API (TypeScript)**: Entry point for submissions.
- **BullMQ (Redis)**: Reliable job queue for background processing.
- **Node Worker (TypeScript)**: The **Orchestrator and Judge**.
- **Go Execution Service (Go)**: The **Stateless Sandbox Executor**.
- **Docker**: Isolation layer for user code execution.

### **Responsibility Matrix**
| Component | Responsibilities | Constraints |
| :--- | :--- | :--- |
| **Node Worker** | Consume BullMQ, Fetch Testcases, Loop Testcases, Call Go Service, **Judging Logic**, Update MongoDB. | **Does NOT execute code.** |
| **Go Service** | Compilation, Execute **ONE** testcase, Enforce Resource Limits, Return JSON Result. | **Does NOT judge output.** |

---

## 2. API Contract (Node Worker ↔ Go Service)

**Endpoint**: `POST /execute`

### **Request Body**
```json
{
  "code": "string",
  "language": "cpp | python",
  "input": "string",
  "timeLimit": 2000,
  "memoryLimit": 512
}
```

### **Response Body**
```json
{
  "status": "success | tle | re | ce",
  "output": "string",
  "error": "string",
  "runtime": 150,
  "exitCode": 0
}
```
- `output`: Content of `stdout`. Empty if `ce`.
- `error`: Content of `stderr` or compilation logs.
- `exitCode`: Process exit code. If `exitCode != 0` and `status == success`, Node Worker must treat it as `re`.

---

## 3. Compilation Logic
- **C++**: 
    - Command: `g++ -O3 solution.cpp -o solution`
    - If command fails: Return `status: "ce"`, include logs in `error`.
- **Python**: 
    - Action: Skip compilation phase.
    - Status: Proceed directly to execution.

---

## 4. Execution Strategy
- **Containerization**: Use **ONE fresh Docker container per testcase**.
- **Preparation**:
    1. Create temp directory `/tmp/sub-{submissionId}`.
    2. Write user code to `solution.cpp` or `solution.py`.
    3. Write testcase input to `input.txt`.
- **Execution**: Run `./solution < input.txt` (C++) or `python3 solution.py < input.txt` (Python).
- **Cleanup**: Delete the entire temp directory immediately after the Go service returns the response.

---

## 5. Resource & Timeout Control (Go Service)
- **Timeout**: Enforced via Go `context.WithTimeout`.
    - If context expires: Kill container immediately -> Return `status: "tle"`.
- **Memory**: Convert `memoryLimit` (MB) to **Bytes** before passing to Docker's `HostConfig.Memory`.
- **CPU**: Set `HostConfig.NanoCPUs` (e.g., `0.5` CPU).
- **Network**: Set `NetworkMode: "none"` (mandatory).

---

## 6. Judge Logic Algorithm (Node Worker)

For a given submission:
1. Fetch all testcases from MongoDB.
2. Initialize `passedTestCases = 0`, `totalTestCases = count(testcases)`.
3. Set submission status to `running`.
4. **Loop through testcases**:
    - Call Go Service `POST /execute`.
    - If `status == "ce"`: Stop loop -> Final verdict = **Compilation Error**.
    - If `status == "tle"`: Stop loop -> Final verdict = **Time Limit Exceeded**.
    - If `status == "re"` OR `exitCode != 0`: Stop loop -> Final verdict = **Runtime Error**.
    - **Normalization**:
        - Normalize line endings (`\r\n` -> `\n`).
        - Trim trailing spaces from **every line**.
        - Trim global leading/trailing whitespace.
    - **Comparison**: Compare normalized output with normalized expected output.
    - If mismatch: Stop loop -> Final verdict = **Wrong Answer**.
    - If match: `passedTestCases++`.
5. **Finalize**:
    - If `passedTestCases == totalTestCases`: Final verdict = **Accepted**.
    - Update MongoDB with `verdict`, `passedTestCases`, and `totalTestCases`.

---

## 7. Failure Handling & Retries
- **User Errors** (`ce`, `re`, `tle`, `wa`): **No retries**.
- **System Errors** (Go Service down, Docker daemon failure):
    - Trigger BullMQ **Automatic Retry** (Max 3 attempts).
    - If all retries fail: Mark submission as **Internal Error**.

---

## 8. Minimal Logging Requirements
The system must log the following events for auditability:
1. `Job Started`: `submissionId`, `problemId`.
2. `Go Service Error`: Logs for any 5xx or connection failures.
3. `Container Failure`: Logs if Docker fails to start a container.
4. `Job Finished`: `submissionId`, `verdict`, `passedTestCases/totalTestCases`.

---

## 9. Final Pipeline Summary
1. **Node API**: Receives submission.
2. **BullMQ**: Ingests and persists job.
3. **Node Worker**: Orchestrates testcase loop and judging.
4. **Go Service**: Manages Docker sandbox for one-off execution.
5. **Docker**: Provides hard-isolated execution environment.
6. **MongoDB**: Stores the final verdict and progress metadata.

---
**END OF DESIGN**. Implementation phase begins now.
