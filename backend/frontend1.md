# Frontend API Specification (Phase 1)

This document provides the clean API contract for frontend integration (e.g., Lovable).

---

## 1. List of Endpoints

### Problems
- `GET /problems`: List all available problems.
- `GET /problems/:id`: Get detailed information for a specific problem.

### Submissions
- `POST /submit`: Submit code for a problem.
- `GET /submission/:id`: Poll for the status and result of a submission.

---

## 2. Request/Response Examples

### **GET /problems**
Returns an array of problems for the listing page.

**Example Response:**
```json
[
  {
    "_id": "69ecec0019ae29a88f3caa26",
    "title": "Reverse String",
    "description": "Write a function that reverses a string.",
    "sampleInput": "hello",
    "sampleOutput": "olleh",
    "createdAt": "2026-04-25T17:10:07.280Z"
  }
]
```

### **GET /problems/:id**
Returns full details for the code editor page.

**Example Response:**
```json
{
  "_id": "69ecec0019ae29a88f3caa26",
  "title": "Reverse String",
  "description": "Write a function that reverses a string.",
  "sampleInput": "hello",
  "sampleOutput": "olleh",
  "timeLimit": 2000,
  "memoryLimit": 512
}
```

### **POST /submit**
Submits user code for judging.

**Example Request:**
```json
{
  "userId": "user123",
  "problemId": "69ecec0019ae29a88f3caa26",
  "code": "#include <iostream>...",
  "language": "cpp"
}
```

**Example Response:**
```json
{
  "submissionId": "69ecf56f8cd2e29f83553c52"
}
```

### **GET /submission/:id**
Poll this endpoint to get the result.

**Example Response (Running):**
```json
{
  "_id": "69ecf56f8cd2e29f83553c52",
  "status": "running",
  "result": "Pending",
  "passedTestCases": 0,
  "totalTestCases": 2
}
```

**Example Response (Completed):**
```json
{
  "_id": "69ecf56f8cd2e29f83553c52",
  "status": "completed",
  "result": "Accepted",
  "passedTestCases": 2,
  "totalTestCases": 2,
  "queueTime": 9,
  "executionTime": 368,
  "totalTime": 1361,
  "error": ""
}
```

---

## 3. Status Lifecycle
The frontend must track the `status` field from `GET /submission/:id`.

| Status | Meaning | Verdict Available? |
| :--- | :--- | :--- |
| **`pending`** | Job is in the BullMQ queue waiting for a worker. | No |
| **`running`** | Worker has picked up the job and is executing test cases. | No |
| **`completed`** | Execution is finished. | **Yes** (See `result` field) |

---

## 4. Polling Strategy
1. **Initial**: After receiving `submissionId` from `POST /submit`, wait 1 second.
2. **Frequency**: Poll `GET /submission/:id` every **1.5 seconds**.
3. **Termination**: Stop polling as soon as `status === "completed"`.
4. **Timeout**: Stop polling and show an error if no response after 30 seconds.

---

## 5. Missing Fields & Minimal Fixes
The following minimal changes are required in the backend to support this contract:
1. **Schema Update**: Add `sampleInput` and `sampleOutput` (String) to the `Problem` model.
2. **Controller Update**: Implement `getProblemById` in `problemController.ts`.
3. **Routes Update**: Add `router.get("/:id", ...)` to `problemRoutes.ts`.

---

## 6. Standard Error Format
All error responses (4xx/5xx) will follow this structure:

```json
{
  "message": "Human readable error description",
  "error": "Internal technical error code or stack trace (optional)"
}
```
---
