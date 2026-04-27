# FINAL System Audit & Remediation Plan: Contest Integrity

This document outlines the final, corrected logic for maintaining contest integrity and system security.

---

## 1. Problem Access Logic (CORRECTED)

### **A. Schema Change**
- **Field**: `isPublic: boolean` (Default: `true`).

### **B. Access Rules (`GET /problems/:id`)**
1. If `problem.isPublic === true`: 
    - Grant access to all.
2. If `problem.isPublic === false`:
    - Grant access **ONLY IF**:
        - User is an Admin.
        - **OR** a valid `contestId` is provided in the query params AND the following are true:
            - Contest exists in DB.
            - `problemId` is present in `contest.problemIds`.
            - `contest.startTime <= now < contest.endTime`.

---

## 2. Submission Validation Logic (CORRECTED)

When a user calls `POST /submit`:

1. **Active Contest Check**: Search for any **Active** contest (`startTime <= now < endTime`) that contains the `problemId`.
2. **Enforcement**:
    - **IF an Active Contest is found**:
        - Submission **MUST** include `contestId`.
        - `contestId` in request must match the ID of the discovered Active Contest.
        - Reject with `403 Forbidden` if `contestId` is missing or incorrect.
    - **IF NO Active Contest is found**:
        - Allow submission without `contestId`.
        - (Optional) If a `contestId` is provided for a contest that is not yet started or has ended, reject with `400 Bad Request`.

---

## 3. Server-Side Execution Rules

- **Source of Truth**: All time checks and relationship validations are performed on the server using `Date.now()` and DB queries.
- **No Frontend Trust**: The "contest context" is established by the presence and verification of a `contestId` in the request, not by the referrer URL or frontend state.

---

## 4. Go Executor Cleanup (MANDATORY)

- **Action**: Add `defer os.RemoveAll(tmpDir)` immediately after successful directory creation in `main.go`.
- **Reason**: Ensures that `/sandbox/sub-*` directories are purged even if the execution fails, times out, or the process receives a signal.

---

## 5. Implementation Sequence

1. **Step 1**: Add `isPublic` to `Problem` model and update seeding logic to mark contest problems as `isPublic: false`.
2. **Step 2**: Update `problemController.getProblemById` to implement the triple-check visibility logic (Admin | Public | Valid Active Contest).
3. **Step 3**: Update `submissionController.createSubmission` to perform the "Active Contest Lookup" before accepting the job.
4. **Step 4**: Inject the `os.RemoveAll` defer into the Go executor and rebuild the container.

---
**STATUS: FINALIZED.** This logic prevents leakage and ensures that contest integrity cannot be bypassed by direct API calls.
