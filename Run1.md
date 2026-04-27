# Architecture Design: "Run Code" Feature

This document outlines the design and integration plan for a synchronous "Run Code" feature, providing a low-latency path for developers to test code against sample test cases without the overhead of the persistence and queuing systems.

## 1. Architecture Overview
The `/run` feature implements a **synchronous request-response pattern**. Unlike the asynchronous submission flow, the API layer acts as a direct proxy to the Go Execution Service.

**Flow Diagram:**
`Frontend` ↔ `Node API (Problem Service)` ↔ `Go Executor (Docker Sandbox)`

## 2. Key Differences vs /submit

| Feature | `/submit` (Current) | `/run` (Proposed) |
| :--- | :--- | :--- |
| **Path** | Asynchronous (Queue-based) | Synchronous (Direct) |
| **Persistence** | Permanent (MongoDB) | Transient (In-memory only) |
| **Retry Logic** | BullMQ retries on failure | Fail fast (No retries) |
| **Test Cases** | Full suite (Hidden + Sample) | **Sample test cases only** |
| **UX** | Result history + Polling | Instant feedback |

## 3. Concurrency Handling
*   **Node.js API**: Utilizes non-blocking I/O and `async/await`. Each incoming request triggers a separate HTTP call to the Go service. Node.js manages the socket pool to the executor.
*   **Go Service**: Reuses the existing architecture where each request spawns an isolated Docker container. Go's native concurrency (goroutines) handles multiple simultaneous `/execute` calls.
*   **Resource Risks**: High concurrency in `/run` can lead to **CPU/Memory exhaustion** on the host or **Docker daemon saturation** (max containers reached). This could potentially degrade the performance of the `/submit` workers if they share the same executor host.

## 4. Safety Controls
To protect system stability, the following minimal controls are required:
*   **Concurrency Throttle**: Implement a "Semaphore" or rate-limiter in the Node.js API to cap the number of active `/run` requests (e.g., max 5–10 per user).
*   **Strict Timeouts**: 
    *   Execution timeout in Go (already enforced by Docker/Context).
    *   Socket timeout in Node.js (e.g., 10s) to prevent hung connections from consuming the API's worker threads.
*   **Resource Capping**: Maintain current Docker limits (Memory: 512MB, CPU: 0.5) to prevent a single run from crashing the host.

## 5. API Contract

### **POST `/problems/:id/run`**
**Request Body:**
```json
{
  "code": "string",
  "language": "python | cpp",
  "problemId": "string"
}
```

**Response Body (200 OK):**
```json
{
  "status": "success | error | tle | re | ce",
  "stdout": "string",
  "stderr": "string",
  "runtime": 120, // ms
  "testResults": [
    {
      "input": "...",
      "expected": "...",
      "actual": "...",
      "passed": true
    }
  ]
}
```

## 6. Go Executor Reuse
The Go Execution Service requires **zero architectural changes**. It will reuse the existing `POST /execute` endpoint.
*   The Node API will fetch **only sample test cases** from MongoDB for the given `problemId`.
*   It will iterate through these samples and call the Go Executor directly.
*   **Note**: For better performance, the API can call the executor in parallel for multiple sample cases using `Promise.all`.

## 7. Failure Handling
*   **Go Service Unreachable**: Return `503 Service Unavailable` with a user-friendly message ("Execution service is busy").
*   **Timeout**: If the executor exceeds the limit, return a `status: "tle"` response.
*   **Container/Sandbox Failure**: Catch low-level Docker errors and return `status: "error"` with "Sandbox initialization failed."

## 8. Frontend Behavior
*   **Trigger**: A "Run Code" button distinct from the "Submit" button.
*   **Visuals**: Show a "Running..." overlay or inline loader in the `ResultPanel`.
*   **Output**: Display the `stdout`/`stderr` and sample test case results immediately in a dedicated "Run Result" tab.
*   **No Persistence**: If the user refreshes the page, the "Run" result disappears (it is not saved in the "Activity Log").
