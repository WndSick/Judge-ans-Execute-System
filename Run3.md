# Final Implementation Plan: "/run" Feature (Refined)

This plan outlines the hardened, implementation-ready strategy for the low-latency `/run` execution path. It ensures system stability, fair resource allocation, and robust error handling.

## 1. High-Level Architecture
The `/run` feature is a synchronous, queue-free path that acts as a direct proxy between the Node.js API and the Go Execution Service.

*   **Isolation**: Operates independently of BullMQ and MongoDB persistence.
*   **Target**: Executes code ONLY against **Sample Test Cases** defined in the `Problem` model.
*   **Reusability**: Uses the existing Go Executor `POST /execute` endpoint.

## 2. Backend Implementation Plan

### Step 1: API Route
*   **Endpoint**: `POST /problems/:id/run`
*   **Middleware**: `authMiddleware` for user identification.

### Step 2: Controller & Concurrency Control
We implement a dual-layer in-memory semaphore (Global + Per-User) to prevent container explosion and resource exhaustion.

*   **PER-USER limit**: `1` (One active run per user).
*   **GLOBAL limit**: `5` (Maximum 5 concurrent `/run` containers system-wide).
*   **Justification**: Each Docker container is capped at `0.5 CPU`. A global limit of 5 ensures that `/run` consumes at most `2.5 CPU` units, leaving significant overhead for the 4 dedicated `/submit` worker slots.
*   **Failure Behavior**: If limits are reached, return `429 Too Many Requests` with the message: **"Too many run requests. Please wait a few seconds."**

### Step 3: Standardized Status Definition
All responses from `/run` MUST use exactly one of the following status values to maintain consistency with the `/submit` system:

| Status | Description |
| :--- | :--- |
| **success** | All sample test cases passed. |
| **wa** | One or more sample test cases yielded the wrong output. |
| **tle** | Execution exceeded the problem's time limit or 10s ceiling. |
| **re** | Code crashed during execution (Runtime Error). |
| **ce** | Code failed to compile. |
| **error** | Internal system failure (Go service down, sandbox failed). |

### Step 4: Execution Strategy & Loop (Refined)
Test cases MUST be executed **sequentially** with early exit and failure reporting.

**Execution Flow Snippet:**
1.  **Acquire Slots**: Global and Per-User counters.
2.  **Try Block**:
    *   Iterate through problem `examples` (index `i`).
    *   For each example:
        *   **Execute**: Call Go Executor (Axios timeout 10s).
        *   **Normalize**: Trim, normalize line endings, and remove trailing spaces.
        *   **Evaluate**:
            *   If `status != "success"` → **Break** with status (`re`, `ce`, or `tle`).
            *   If `actual != expected` → **Break** with status `wa`.
    *   **Capture Failure**: If a break occurred, store `failedTestCaseIndex: i`, `input`, `expected`, and `actual`.
3.  **Finally Block**:
    *   **CRITICAL**: Release Global and Per-User semaphore slots.

### Step 5: API Response Structure

**Success Example:**
```json
{
  "status": "success",
  "passed": 3,
  "total": 3,
  "runtime": 120
}
```

**Failure Example:**
```json
{
  "status": "wa",
  "failedTestCaseIndex": 2, // 0-based
  "input": "4\n2 7 11 15\n9",
  "expected": "0 1",
  "actual": "0 2",
  "runtime": 90
}
```

---

## 3. Frontend Integration Plan

### UI Behavior
*   **Run Button**: Located next to "Submit". Disabled during execution.
*   **Instant Result**: Display results in the `ResultPanel` using a temporary local state.
*   **Failure Display**: If `failedTestCaseIndex` is present, highlight that specific case and show the diff.
*   **No History**: Results are strictly transient.

---

## 4. Safety & System Protection
*   **Reserved Capacity**: The Global limit of 5 preserves 75% of execution capacity for `/submit` workers.
*   **Cleanup**: The mandatory `finally` block ensures slots are never leaked.
