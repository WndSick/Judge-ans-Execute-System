# System Audit 101 - Current State & Missing Features

## 🔴 Critical Issues
1.  **Code Execution Stuck**: Submissions often remain in "Judging" or "Running" state. This is likely due to the Go Executor service not being active or failing to respond, causing BullMQ to retry indefinitely or leave the database in an inconsistent state.
2.  **Sandbox Isolation**: While Docker is intended, the local environment needs the Go service running and Docker daemon active. If Docker fails, the executor fails.
3.  **Missing Error Propagation**: If the Go service fails (e.g., connection refused), the user sees a permanent "Running" spinner instead of a "System Error" message.

## 🛠️ Backend Gaps
1.  **Admin APIs**: There are no APIs to:
    *   Create/Edit/Delete Problems.
    *   Create/Edit/Delete Contests.
    *   Manage Users.
2.  **Validation**: Missing strict input validation for Problem creation (e.g., test case format).
3.  **Leaderboard**: The Contest system exists but there is no logic to calculate ranks or display a leaderboard.

## 🎨 Frontend (UI/UX) Gaps
1.  **Admin Panel**: Completely missing. Admins currently have to use the database directly or script files to add problems.
2.  **Contest UX**:
    *   No countdown timer for active contests.
    *   No "Upcoming" vs "Past" contest separation in the list.
    *   No "Submit" confirmation or results summary page.
3.  **Auth Flow**:
    *   No "Profile" page.
    *   No password reset functionality.
4.  **Problem Description**: The problem statement rendering is basic (no Markdown support, limited formatting).

## 🚀 Future Roadmap (Not Work Done)
1.  **Markdown Support**: Problem statements should support LaTeX and Markdown.
2.  **Social Features**: Discussion threads per problem.
3.  **Efficiency**: Caching problem lists in Redis to reduce MongoDB load.
4.  **Security**: Rate limiting on the `/submit` endpoint to prevent spam.
