# Run Code Design & Submission System Audit

This document provides a revised design for the `/run` path and a technical audit of the existing `/submit` execution engine.

---

## PART 1: Fixed /run Design

### 1. Execution Strategy
*   **Sequential Execution**: Test cases for a "Run" request MUST be executed one by one (sequentially).
*   **Early Exit**: Execution stops immediately upon the first failure (Wrong Answer, TLE, or Runtime Error).
*   **Rationale**: 
    *   **Resource Stability**: Sequential execution prevents a single user's `/run` request from spawning multiple simultaneous Docker containers, which would multiply the CPU/RAM load instantly.
    *   **Developer Experience**: Most developers debug iteratively. Seeing the first failing test case is usually sufficient context for debugging.

### 2. Concurrency Model
To prevent system-wide instability (Container Explosion), we implement two layers of throttling:
*   **Global Limit**: A system-wide cap (e.g., max 15 concurrent `/run` containers) enforced via a global semaphore (Redis-backed or In-memory). This ensures the Docker daemon is never saturated.
*   **Per-User Limit**: Limits an individual user to 1 active `/run` process at a time.
*   **Enforcement**: Handled in the Node.js API layer. Requests exceeding the limit are rejected with a `429 Too Many Requests` status.

### 3. Safety Controls & Priority
*   **Capacity Reservation**: We reserve "slots" for the `/submit` workers. If the executor host has a capacity for 20 containers, and we have 4 workers, we cap `/run` at 15 to ensure workers always have overhead.
*   **Strict Timeout**: `/run` requests use the same per-problem time limit but may have a stricter global ceiling (e.g., 5 seconds) to ensure quick release of resources.

### 4. Final Flow (Corrected)
1.  **Frontend**: User clicks "Run".
2.  **API**: Fetch **sample testcases** only from MongoDB.
3.  **Throttling**: Verify Global/User concurrency slots.
4.  **Loop**: 
    *   Call Go Executor for Testcase #1.
    *   If Result != Success → **EXIT LOOP** and return result.
    *   If Result == Success → Move to Testcase #2.
5.  **Aggregate**: Return combined output and status of the first failure or final success.

---

## PART 2: /submit System Audit

### 1. End-to-End Flow
1.  **Frontend**: User submits code.
2.  **API**: Validates request, creates `Submission` document in MongoDB with `status: "pending"`.
3.  **Queue**: API adds a job to `submissionQueue` via BullMQ.
4.  **Worker**: One of the 4 concurrent worker slots picks up the job, updates DB to `status: "running"`.
5.  **Execution**: Worker iterates test cases and calls Go Executor via HTTP.
6.  **Persistence**: Worker updates `Submission` in MongoDB with verdict and metrics.
7.  **Polling**: Frontend polls `GET /submission/:id` until `status: "completed"`.

### 2. Technical Configuration (from code)
*   **Queue Name**: `submissionQueue`
*   **Worker Concurrency**: `4` (The worker processes up to 4 jobs simultaneously).
*   **Rate Limiter**: `10 jobs per 1000ms` (Prevents DB/Redis hammering).
*   **Retries**: BullMQ defaults apply (currently no custom retry strategy in code).

### 3. Queue Behavior
*   **Queue Size**: Effectively unlimited (backed by Redis).
*   **Backlog Handling**: If submissions spike, the queue grows. Since there is no "max queue size" defined, the only bottleneck is the processing speed of the 4 worker slots.
*   **Latency**: High backlog results in increased `queueTime` seen in the UI.

### 4. Container Resource Limits
*   **CPU**: Hard-capped at **0.5 CPU** (`0.5 * 1e9` NanoCPUs).
*   **Memory**: Dynamically capped based on the **Problem's MemoryLimit** (converted to bytes).
*   **Networking**: Disabled (`NetworkMode: "none"`) for security.

### 5. System Capacity & Bottlenecks
*   **Max Concurrent Submissions**: `4` (Limited by worker concurrency).
*   **Max Concurrent Containers**: `4` (One per active worker).
*   **Bottleneck Analysis**:
    *   **CPU**: Docker container overhead is significant. 4 containers at 0.5 CPU each require at least 2 cores for the executor alone.
    *   **Docker Daemon**: The primary bottleneck for scaling. Rapidly creating/destroying containers can lead to daemon latency.
    *   **Network**: Internal HTTP calls between Worker and Go service are low latency on `localhost`.

### 6. Risk Analysis
*   **Overload**: If the Go service is flooded with `/run` requests without the proposed limits, it could starve the `/submit` workers of CPU time.
*   **Backlog**: 4 workers may be insufficient for a contest with 100+ concurrent users, leading to multi-minute wait times.
*   **Crash**: If the Go service crashes, workers will mark submissions as "Internal Error" after a timeout, as seen in the current error handling logic.
