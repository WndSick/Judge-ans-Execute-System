# FINAL Phase 2 & 3: Auth System & Admin Panel Plan

This is the final, locked, implementation-ready blueprint for the Auth system, Admin panel, and Contest system. No further planning is required; this document will be followed exactly.

---

## 1. Final Schema Definitions & Indexing

### **User Model**
- `email`: String (unique, required, indexed, trimmed, **lowercased**)
- `password`: String (bcrypt hashed, saltRounds=10, minLength=8)
- `role`: "user" | "admin" (default: "user")

### **Contest Model**
- `title`: String (required)
- `startTime`: Date (required, indexed)
- `endTime`: Date (required)
- `problemIds`: Array of `ObjectId` (references `Problem`)

### **Submission Model Updates**
- `userId`: `ObjectId` (references `User`, indexed, required)
- `contestId`: `ObjectId` (references `Contest`, optional)
- **Sorting**: All listing queries (`/submissions/me`) MUST use `{ createdAt: -1 }`.

---

## 2. Final API Protection Rules

| Access Level | Routes |
| :--- | :--- |
| **Public** | `POST /auth/register`, `POST /auth/login`, `GET /problems`, `GET /contests` |
| **Auth Required** | `GET /problems/:id`, `POST /submit`, `GET /submissions/me`, `GET /submission/:id` |
| **Admin Only** | `ALL /admin/*` (CRUD Problems, CRUD Contests, View all submissions) |

### **Authorization Header**
- Format: `Authorization: Bearer <token>`
- Reject missing header, malformed tokens, or expired tokens.

---

## 3. Security & Validation Rules (Locked)

### **Authentication**
- **Registration**: 
    - Check if email exists (Return `409 Conflict: { "message": "User already exists" }`).
    - Normalize email (trim + lowercase).
- **JWT**:
    - Payload: `{ userId: string, role: string }`
    - Expiry: `7d`

### **Submission Access Control**
- `GET /submission/:id`:
    - User: Access granted ONLY if `submission.userId === req.user.userId`.
    - Admin: Global access.
- `GET /submissions/me`:
    - Filter by `userId: req.user.userId`.

### **Contest Submission Validation**
- If `submission` includes `contestId`:
    - Reject if `now < contest.startTime` or `now >= contest.endTime`.
    - Return `403 Forbidden: { "message": "Contest is not active" }`.

### **Problem Deletion Safety**
- Prevent deletion of a Problem if:
    - It is linked to any Contest.
    - It has any existing Submissions.
    - Return `400 Bad Request` with appropriate message.

---

## 4. Contest Logic (Final Version)
- **Active Contest**: Defined as `startTime <= now < endTime`.
- **`GET /contests`**: Returns contests where `endTime > now` (Includes Upcoming and Active).
- **`GET /contests/:id`**:
    - If `now < startTime`: Return metadata ONLY (id, title, startTime, endTime). **Hide `problemIds`**.
    - If `now >= startTime`: Return full details including problems.

---

## 5. Standard Error Format
All APIs must return errors in this format:
```json
{
  "message": "Human readable description",
  "error": "Technical code/stack (optional)"
}
```

---

## 6. Implementation Plan (Step-by-Step)

1. **Auth Foundation**:
    - Install `bcryptjs` and `jsonwebtoken`.
    - Implement `User` model with normalization and password hashing.
    - Implement Register/Login routes with 409 handling.
2. **Middleware & Protection**:
    - Build `authMiddleware` to verify `Bearer` tokens.
    - Build `adminMiddleware`.
    - Refactor existing routes (Submission/Problem) to apply protection.
3. **Admin Problem Management**:
    - Implement CRUD for Problems with deletion safety checks.
    - Ensure `GET /problems/:id` hides testcases from non-admins.
4. **Contest System**:
    - Implement `Contest` model and Admin CRUD.
    - Implement public Contest routes with time-based visibility logic.
    - Add contest validation to the `POST /submit` endpoint.
5. **Database Finalization**:
    - Apply indexes to `User.email`, `Submission.userId`, and `Contest.startTime`.

---
**END OF PLAN**. Ready for implementation.
