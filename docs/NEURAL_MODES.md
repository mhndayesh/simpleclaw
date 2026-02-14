# Neural Operative Modes

SimpleClaw features a unique **Neural Mode** system that allows you to tune the assistant's context and intelligence to balance speed, cost, and depth.

## The Three Modes

### 1. `super-eco` (The Ghost)
Designed for maximum speed and minimum token usage.
- **Turn Limit**: Strictly 1 turn per request.
- **Compaction**: Aggressive summary (10-word snippets).
- **Best For**: Quick lookups.

### 2. `eco` (The Operative)
The bridge between speed and capability.
- **Turn Limit**: 3 turns.
- **Compaction**: Balanced summary (15-word snippets).
- **Lego Architecture**: Loads the `core_persona` by default; toolbox is on-demand.
- **Best For**: Targeted tasks and cost-aware development.

### 3. `standard` (The Assistant)
The default balanced experience.
- **Turn Limit**: 5 turns.
- **Lego Architecture**: Loads `core_persona` and `toolbox` by default.
- **Best For**: General coding and debugging.

### 4. `full-context` (The Engineer)
Unrestricted power for complex problem-solving.
- **Turn Limit**: 10 turns.
- **Lego Architecture**: Pre-loads ALL bricks (`project_map`, `protocols`, etc.).
- **Compaction**: None.
- **Best For**: Major refactors.


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

