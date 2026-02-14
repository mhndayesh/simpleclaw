# Neural Operative Modes

SimpleClaw features a unique **Neural Mode** system that allows you to tune the assistant's context and intelligence to balance speed, cost, and depth.

## The Three Modes

### 1. `super-eco` (The Ghost)
Designed for maximum speed and minimum token usage.
- **Turn Limit**: Strictly 1 turn per request (the assistant cannot use tools in a loop).
- **Compaction**: Aggressive. It only keeps the last **3 user turns** as raw text. Everything older is summarized into tiny 10-word snippets.
- **Best For**: Quick questions, simple file lookups, and one-off tasks.

### 2. `standard` (The Assistant)
The default balanced experience.
- **Turn Limit**: 5 turns (allows for simple tool sequences like "read file -> edit file").
- **Compaction**: Balanced. Keeps the last **10 user turns** as raw text. Older history is grouped and summarized with 18-word snippets.
- **Best For**: General coding tasks, debugging, and multi-step operations.

### 3. `full-context` (The Engineer)
Unrestricted power for complex problem-solving.
- **Turn Limit**: 10 turns (allows for deep research and multi-file rewrites).
- **Compaction**: **None**. The entire conversational history is sent to the model in every request. 
- **Danger**: In long sessions, this can consume a massive amount of tokens and may hit model context limits.
- **Best For**: Major refactors, architecting new features, and deep technical discussions.

---

## How it Works: Tiered Summarization
SimpleClaw uses a **5-turn trigger** to keep context windows short. When triggered:
1.  **Selection**: The system checks if the **Mechanical Summarizer Switch** is ON. If so, it uses the dedicated engine.
2.  **Prompting**: A mode-specific prompt is sent:
    - `super-eco`: "Pin-point summary: errors/results only. Max 3 lines."
    - `eco`: "Brief bullets: Issue/Solution/Progress."
    - `standard`: "Detailed bullets: Steps taken/current status."
3.  **Compaction**: Active memory is pruned. Only the `system` identity, the latest `sessionSummary`, and the last few exchanges are kept.
4.  **Isolation**: On reset, the current summary is saved to `storage/sessions/` and memory is wiped clean.

