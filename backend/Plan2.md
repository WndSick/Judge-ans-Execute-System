# FINAL Phase 1: Backend Upgrades Plan (Observability & Control)

This is the locked, implementation-ready blueprint for the Phase 1 backend upgrades. This design is final and will be followed exactly during implementation.

---

## 1. Metric Definitions (Locked)
Three metrics will be stored in the `Submission` model to track the lifecycle of every execution.

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **`queueTime`** | `workerStartTime - job.data.queuedAt` | Calculated once at job start. Represents time spent in the BullMQ queue. |
| **`executionTime`** | `Σ (response.runtime)` | **Sum of all actual code execution runtimes** from Go. Accumulates for success, WA, RE, and TLE. |
| **`totalTime`** | `workerEndTime - submission.createdAt` | End-to-end duration including queue wait, execution, and all overhead. |

---

## 2. Final Worker Flow (Strict Order)
The `submissionWorker.ts` MUST follow this exact sequence:

1. **Job Received**: Mark `const workerStartTime = Date.now()`.
2. **Calculate queueTime**: `submission.queueTime = workerStartTime - job.data.queuedAt`.
3. **Initialize Status**: Set `submission.status = "running"`. Save to MongoDB immediately.
4. **Initialize Loop Variables**: `let totalExecutionTime = 0`, `let passedTestCases = 0`, `const loopStartTime = Date.now()`.
5. **Loop Testcases**:
    * **Pre-Check Timeout**: If `Date.now() - loopStartTime > 15000` (15s limit), set verdict = **Time Limit Exceeded (Global)** and break.
    * **Execute**: Call Go Execution Service.
    * **Accumulate Time**: `totalExecutionTime += (response.runtime ?? 0)`. If `runtime` is missing, log an error but continue with `0`.
    * **Judge Output**:
        - If `status == success` and output matches: `passedTestCases++`.
        - If `status == success` and output mismatches: verdict = **Wrong Answer**, break loop.
        - If `status != success` (e.g., `ce`, `re`, `tle`): Set corresponding verdict and break loop.
6. **Finalize**:
    - `const workerEndTime = Date.now()`.
    - `submission.totalTime = workerEndTime - submission.createdAt.getTime()`.
    - `submission.executionTime = totalExecutionTime`.
    - `submission.passedTestCases = passedTestCases`.
    - `submission.status = "completed"`.
7. **Persist**: One final save to MongoDB.

---

## 3. Error Handling Mapping (Locked)
| Scenario | Action / Result |
| :--- | :--- |
| **Go Service Unreachable** | Throw error -> BullMQ Automatic Retry (Max 3). |
| **Docker Daemon Failure** | Stop -> Mark verdict = **Internal Error**. |
| **exitCode != 0** (Go status: `re`) | Stop -> Mark verdict = **Runtime Error**. |
| **Compilation Failure** (Go status: `ce`) | Stop -> Mark verdict = **Compilation Error**. |
| **Execution Timeout** (Go status: `tle`) | Stop -> Mark verdict = **Time Limit Exceeded**. |
| **All Retries Fail** | Stop -> Mark verdict = **Internal Error**. |

---

## 4. Structured Logging Structure
All logs MUST include `submissionId` in the format `[Sub:${id}]`.

- **Job Start**: `[Worker] [Sub:${id}] Job received. Queue wait: ${queueTime}ms`
- **Testcase Start**: `[Worker] [Sub:${id}] [TC:${i}/${total}] Sending to executor...`
- **Go Response**: `[Worker] [Sub:${id}] [TC:${i}] Status: ${status} | Runtime: ${runtime}ms | ExitCode: ${exitCode}`
- **Error Logs**: 
    - `[Worker] [Sub:${id}] [ERROR] Go Service failure: ${message}`
    - `[Worker] [Sub:${id}] [ERROR] Docker/Sandbox failure: ${message}`
    - `[Worker] [Sub:${id}] [CRITICAL] Unexpected exception: ${stack}`
- **Job End**: `[Worker] [Sub:${id}] Finished. Verdict: ${verdict} | Passed: ${passedTestCases}/${total} | Execution: ${executionTime}ms | Total: ${totalTime}ms`

---

## 5. Concurrency & Safety Control
- **BullMQ Concurrency**: **3–4** parallel jobs.
- **Enforcement**: This limits the host to 3–4 simultaneous Docker containers.
- **Risks**:
    - **CPU Saturation**: High parallel testcase execution can cause CPU thrashing, increasing reported `totalTime` even if `executionTime` remains low.
    - **RAM Exhaustion**: Each container uses `512MB`. 4 containers = `2GB`. Exceeding this risk host OOM.
- **Global Safety Limit**: The 15s limit enforced in the worker loop is the final protection against zombie jobs or hung executors.

---
**END OF PLAN**. Ready for implementation.
