# Complete Backend API Inventory (Phase 2 & 3)

This document provides a comprehensive inventory of all available backend APIs for frontend integration, including access levels, request/response structures, and edge behaviors.

---

## 1. Auth APIs

### **POST /auth/register**
- **Access Level**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Example Response**:
  ```json
  {
    "message": "User registered successfully",
    "userId": "69ecec0019ae29a88f3caa26"
  }
  ```
- **Edge Behavior**:
    - Returns `409 Conflict` if email already exists.
    - Normalizes email (trim + lowercase) before saving.
    - Minimum password length is 8.

### **POST /auth/login**
- **Access Level**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123"
  }
  ```
- **Example Response**:
  ```json
  {
    "token": "eyJhbGci...",
    "userId": "69ecec0019ae29a88f3caa26",
    "role": "user"
  }
  ```
- **Edge Behavior**:
    - Returns `401 Unauthorized` if email or password mismatches.
    - Token expires in 7 days.

---

## 2. Problem APIs

### **GET /problems**
- **Access Level**: Public
- **Example Response**:
  ```json
  [
    {
      "_id": "69ecec0019ae29a88f3caa26",
      "title": "Two Sum",
      "description": "Find indices of two numbers...",
      "sampleInput": "9\n2 7 11 15",
      "sampleOutput": "0 1",
      "timeLimit": 2000,
      "memoryLimit": 512,
      "isPublic": true
    }
  ]
  ```
- **Edge Behavior**:
    - Only returns problems where `isPublic: true`.
    - `testcases` are **never** included in this response.

### **GET /problems/:id**
- **Access Level**: Auth Optional (Public if `isPublic: true`)
- **Example Response**:
  ```json
  {
    "_id": "69ecec0019ae29a88f3caa26",
    "title": "Two Sum",
    "description": "...",
    "sampleInput": "...",
    "sampleOutput": "...",
    "timeLimit": 2000,
    "memoryLimit": 512,
    "isPublic": true
  }
  ```
- **Edge Behavior**:
    - If `isPublic: false`, returns `403 Forbidden` unless:
        - User is an Admin.
        - OR a valid `contestId` is provided for an active contest containing this problem.

---

## 3. Contest APIs

### **GET /contests**
- **Access Level**: Public
- **Example Response**:
  ```json
  [
    {
      "_id": "69ecf56f8cd2e29f83553c52",
      "title": "Weekly Contest 1",
      "startTime": "2026-04-26T10:00:00Z",
      "endTime": "2026-04-26T12:00:00Z"
    }
  ]
  ```
- **Edge Behavior**:
    - Returns all contests where `endTime > now`.

### **GET /contests/:id**
- **Access Level**: Public
- **Example Response**:
  ```json
  {
    "_id": "69ecf56f8cd2e29f83553c52",
    "title": "Weekly Contest 1",
    "startTime": "...",
    "endTime": "...",
    "problemIds": ["69ecec0019ae29a88f3caa26"]
  }
  ```
- **Edge Behavior**:
    - If `now < startTime`, `problemIds` array is **hidden** from the response.
    - After `startTime`, full details including problem IDs are returned.

---

## 4. Submission APIs

### **POST /submit**
- **Access Level**: Auth Required
- **Request Body**:
  ```json
  {
    "problemId": "69ecec0019ae29a88f3caa26",
    "code": "...",
    "language": "cpp",
    "contestId": "69ecf56f8cd2e29f83553c52" (optional)
  }
  ```
- **Example Response**:
  ```json
  {
    "submissionId": "69ecf56f8cd2e29f83553c52"
  }
  ```
- **Edge Behavior**:
    - `userId` is automatically pulled from the JWT token.
    - If the problem is in an **active contest**, `contestId` is mandatory and must match.
    - Submissions after `contest.endTime` are rejected with `403 Forbidden`.

### **GET /submission/:id**
- **Access Level**: Auth Required
- **Example Response**:
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
- **Edge Behavior**:
    - Users can ONLY access their own submissions.
    - Admins have global access to all submissions.

### **GET /submissions/me**
- **Access Level**: Auth Required
- **Example Response**:
  ```json
  [
    {
      "_id": "...",
      "status": "completed",
      "result": "Accepted",
      "createdAt": "..."
    }
  ]
  ```
- **Edge Behavior**:
    - Returns submissions for the logged-in user only.
    - Sorted by `createdAt` DESC (latest first).

---

## 5. Admin APIs

### **Problem Management**
- **POST /admin/problems**: Create problem (includes `testcases`).
- **GET /admin/problems**: List all problems (includes private ones).
- **GET /admin/problems/:id**: Get full problem details including `testcases`.
- **PUT /admin/problems/:id**: Update problem.
- **DELETE /admin/problems/:id**: Delete problem.
    - *Edge Behavior*: Rejected if the problem is linked to a contest or has submissions.

### **Contest Management**
- **POST /admin/contests**: Create contest.
- **GET /admin/contests**: List all contests.
- **GET /admin/contests/:id**: Get contest details.
- **PUT /admin/contests/:id**: Update contest.
- **DELETE /admin/contests/:id**: Delete contest.

### **Submission Management**
- **GET /admin/submissions**: List all submissions across all users.

---

## 6. Standard Error Format
All API errors follow this structure:
```json
{
  "message": "Human readable error description",
  "error": "Technical detail or stack trace (optional)"
}
```
---
