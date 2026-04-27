# Forge: Distributed Code Execution Platform

Forge is a high-performance, distributed online judge system designed for scalability and reliability. It features a sandboxed execution environment using Docker and a robust queuing system using BullMQ.

## 🚀 Key Features
- **Distributed Architecture**: Node.js API, BullMQ for task management, and a dedicated Go-based execution service.
- **Sandboxed Execution**: Code runs in isolated Docker containers with strict CPU and memory limits.
- **Multiple Languages**: Support for Python and C++ (extensible).
- **Contest System**: Built-in support for competitive programming contests.
- **Modern UI**: A premium, responsive frontend built with React, Vite, and Tailwind CSS.
- **Fast "Run Code" Path**: Optimized synchronous execution path for quick testing.

## 🛠️ Technology Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB, BullMQ, Redis.
- **Execution Service**: Go, Docker SDK.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide-React.

## 📦 Project Structure
- `backend/`: Express API and BullMQ workers.
- `executor/`: Go service for Docker container orchestration.
- `code-canvas/`: React frontend application.

## 🚦 Getting Started
1. **Prerequisites**: Install Node.js, Go, Docker, and Redis.
2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. **Executor**:
   ```bash
   cd executor
   go run main.go
   ```
4. **Frontend**:
   ```bash
   cd code-canvas
   npm install
   npm run dev
   ```

## 📜 License
MIT
