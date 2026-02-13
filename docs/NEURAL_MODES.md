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

## How it Works: Mode-Aware Compaction
SimpleClaw doesn't just "forget" old messages. When compaction is triggered (in `super-eco` and `standard`):
1.  It identifies the "cutoff" point for raw messages.
2.  It groups older messages (User/Assistant pairs).
3.  It converts these groups into `system` summary messages that look like this:
    `[standard Summary] (user) How do I... | (assistant) You should use...`
4.  This allows the model to still "remember" the broad strokes of the conversation without wasting thousands of tokens on exact wording.
