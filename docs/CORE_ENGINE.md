# Core Engine Architecture

SimpleClaw is built on a modular "assistant-first" architecture. The core logic resides in `src/core/`.

## 🧠 Memory Management ([memory.ts](file:///c:/simpleclaw/src/core/memory.ts))
The `SessionMemory` class handles everything related to persistence.
- **Persistence**: Data is stored in `storage/session_[id].json`.
- **Metadata**: Each session has a `.meta.json` file storing usage tokens, request counts, and the current **Neural Mode**.
- **Mode-Aware Compaction**: SimpleClaw doesn't just truncate history; it summarizes older turns based on the selected mode to maintain context while saving tokens.

## 🛠️ Tool Execution System ([tools.ts](file:///c:/simpleclaw/src/core/tools.ts))
SimpleClaw gives the models raw power to interact with the host system via two specific tags:

1.  **`<EXEC>command</EXEC>`**: Executes any shell command via `child_process.exec`.
2.  **`<WRITE path="file.ts">content</WRITE>`**: Writes content to any path relative to the project root.

The Assistant uses these tools to add new features or adjust its own source code on the fly.

## 👥 Identity & Prompts ([identity.ts](file:///c:/simpleclaw/src/core/identity.ts))
System prompts are dynamic and generated based on the current mode.
- **Neural Protocol Injection**: Each mode has a specific "Operational Directive" appended to the system prompt.
- **User Overrides**: If a `fresh-start.md` file exists in the root, it is automatically appended to the default identity persona, allowing users to permanentely customize the assistant's behavior.

## 🛣️ Path Calibration ([paths.ts](file:///c:/simpleclaw/src/core/paths.ts))
To ensure portability, the `getProjectRoot()` utility:
1.  Checks for a `SIMPLECLAW_ROOT` entry in `.env`.
2.  If missing, it traverses up to find the nearest `package.json`.
3.  Ensures all file operations are anchored to this absolute path, making the app drive-folder agnostic.
