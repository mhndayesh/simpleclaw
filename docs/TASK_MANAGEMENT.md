# Task Management & Background Execution

SimpleClaw features a robust task management system designed to handle concurrent requests and long-running background operations without blocking the main conversational flow.

## 🚥 Request Queuing

To ensure session consistency and prevent memory corruption, SimpleClaw serializes all chat requests for a given session.

- **Per-Session Isolation**: If multiple messages are sent to the same session simultaneously, they are queued and processed one by one.
- **Implementation**: Managed by the `RequestQueue` in `src/core/queue.ts`.

## 🛰️ Background Tasks

The assistant can delegate long-running tasks to the background using the `<BACKGROUND_EXEC>` tag.

### Usage
```xml
<BACKGROUND_EXEC>npm install && npm test</BACKGROUND_EXEC>
```

### How it Works
1. **Delegation**: When the assistant emits a `<BACKGROUND_EXEC>` tag, the server spawns a child process and returns a Task ID immediately.
2. **Persistence**: The `BackgroundProcessManager` (`src/core/tasks.ts`) tracks the process's status (running, completed, failed) and captures all output.
3. **Asynchronous Reporting**: At the start of the *next* turn in that session, the server checks for finished background tasks and injects a "System Log" message with the results.

## 📅 Simple Scheduler

SimpleClaw includes a lightweight `SimpleScheduler` for delay-based tasks, enabling basic automated workflows.

---
*Inspired by the OpenClaw architecture.*
