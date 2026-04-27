# Final Implementation Plan: "/run" Feature

This plan outlines the step-by-step implementation of the low-latency `/run` execution path, ensuring zero impact on the existing `/submit` flow.

## 1. High-Level Architecture
The `/run` feature bypasses the BullMQ queue and MongoDB persistence layers. It provides a **direct synchronous bridge** between the Node.js API and the Go Execution Service.

*   **Isolation**: No jobs are added to Redis; no records are created in MongoDB.
*   **Reusability**: Directly utilizes the existing `POST /execute` endpoint on the Go Executor (Port 8080).
*   **Context**: Only operates on **Sample Test Cases** defined in the `Problem` model.

## 2. Backend Implementation Plan

### Step 1: API Route
Add a new protected route to `problemRoutes.ts`:
*   **Endpoint**: `POST /problems/:id/run`
*   **Middleware**: `authMiddleware` (Required to enforce per-user limits).

### Step 2: Controller Logic
1.  Verify `problemId` exists.
2.  Fetch problem metadata: `title`, `examples` (for sample inputs), `timeLimit`, `memoryLimit`.
3.  Validate payload: `code` and `language` must be present.

### Step 3: Concurrency Control (Gatekeeper)
To prevent "Container Explosion," we implement a two-layer in-memory semaphore in the API layer:
*   **PER-USER limit**: `1` (A user cannot trigger a second run while the first is active).
*   **GLOBAL limit**: `5` (The system will only handle 5 simultaneous "Run" requests across all users).
*   **Enforcement**: If a limit is reached, return `429 Too Many Requests` with a "System is busy, please try again" message.

### Step 4: Execution Loop
The controller will execute test cases **sequentially**:
1.  Iterate through the `examples` array of the problem.
2.  For each example:
    *   Call Go Executor with `example.input`.
    *   Wait for response.
    *   If `status != "success"` OR `output != example.output` → **EXIT LOOP** immediately.
3.  **Aggregate**: If all pass, return `Accepted`. Otherwise, return the result of the failing test case.

### Step 5: Go Executor Integration
*   **Payload**: Standard JSON matching `ExecuteRequest` (code, language, input, limits).
*   **Request**: `axios.post("http://localhost:8080/execute", ...)`
*   **No Changes**: The Go service remains untouched as it already handles Docker container isolation.

### Step 6: Timeout Handling
*   **Per-request ceiling**: 10 seconds. 
*   **Logic**: If the executor takes longer than 10s (or the problem's limit), Node.js will terminate the socket and return a "TLE" or "Request Timeout" to the frontend.

### Step 7: Error Handling
*   **Executor Down**: Catch connection errors; return `503 Service Unavailable`.
*   **Sandbox Failure**: Return `500 Internal Error` if Docker fails to initialize.
*   **Code Error**: Map `ce` (Compile Error) or `re` (Runtime Error) directly to the response.

---

## 3. Frontend Integration Plan

### Run Button
*   **Location**: Positioned next to the "Submit" button in the `ProblemDetail` header.
*   **State**: Visual "Loading" state and `disabled` attribute while a request is in flight.

### UI Behavior
*   **Instant Result**: Updates the `ResultPanel` with a temporary `submission` object (not from DB).
*   **Components**: Displays `stdout`, `stderr`, and the specific sample test case result (Input/Expected/Actual).

### No Persistence
*   The "Run" result is kept in the React state only.
*   Refreshing the page or navigating away clears the result.

---

## 4. Safety & System Protection
*   **Starvation Prevention**: By limiting `/run` to 5 global slots, we ensure that at least 75% of the system's Docker capacity is available for the 4 primary `/submit` workers.
*   **Memory/CPU**: Every container spawned by `/run` strictly inherits the `memoryLimit` and `0.5 CPU` cap from the problem specification.

---

## 5. Edge Cases
*   **Multiple Clicks**: Handled by frontend `disabled` state and backend per-user semaphore.
*   **Spamming**: Rate-limited at the API level (Global Semaphore).
*   **Partial Failure**: If the 2nd test case fails, the 1st success is acknowledged but the overall result is "Wrong Answer" (Early Exit).

---

## 6. Final Flow (End-to-End)
1.  **Frontend**: User clicks "Run".
2.  **API**: Hits `POST /run`.
3.  **Gate**: Checks if user has `0` active runs and system has `< 5` active runs.
4.  **Fetch**: Retrieves `examples` from Problem DB.
5.  **Run**: Calls Go Executor for `Example #1` → Success.
6.  **Run**: Calls Go Executor for `Example #2` → Failure.
7.  **Exit**: Controller stops execution.
8.  **Response**: API returns failure details to Frontend.
9.  **Display**: `ResultPanel` shows the error and output.
