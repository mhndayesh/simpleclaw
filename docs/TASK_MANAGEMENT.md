# Task Management & Execution Flow 🚥

SimpleClaw manages complex, multi-step tasks through a sequential **Autonomous Heartbeat** system.

## 🔄 The Re-Act Loop
Unlike simple chatbots that send one message and get one answer, SimpleClaw operates in a "Think-Act-Observe" cycle:

1. **Think**: The LLM receives the request and decides on a "Tool Action".
2. **Act**: The server parses the response for XML tags like `<EXEC>` or `<WRITE>`.
3. **Observe**: The server runs the tool, captures the output (success or failure), and feeds it back to the LLM immediately.

This process repeats until the task is complete or the **Step Limit** is reached.

## 🛑 Step Limits by Mode
To protect your token budget and prevent infinite loops, strict limits are enforced:

| Mode | Max Steps per Turn | Philosophy |
| :--- | :--- | :--- |
| **Super-Eco** | 3 | "Stop and Ask" |
| **Eco** | 5 | "Efficient Work" |
| **Standard** | 10 | "Problem Solving" |
| **Full-Context** | Unlimited (capped at 10) | "Expert Autonomy" |

## 🚥 Request Queuing
All requests to the `/api/chat` endpoint are managed by the `Agent` which processes them **serially**. This ensures that file writes and configuration changes happen in the correct order, preventing race conditions or corrupted states.

## 🔘 Background Summarization
Background tasks (like Memory Compaction) are handled as "Hidden Steps" within the main chat loop. 
- When the 5-turn trigger is hit, the Agent pauses its main conversation.
- It performs a dedicated summarization turn (optionally using the **Mechanical Switch**).
- It then resumes the main task, now equipped with a fresh, concise session summary.

---
**Developer Note**: Since execution is sequential, long-running shell commands will block the `chat` response until they finish or timeout. For truly asynchronous tasks, use the `lab` branch implementations which explore multi-process lanes.
