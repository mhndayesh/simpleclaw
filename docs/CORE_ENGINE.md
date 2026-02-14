# SimpleClaw Core Engine: Deep-Dive 🧠

SimpleClaw is built on a high-performance, modular TypeScript architecture optimized for agentic workflows. The core logic is split into three primary unified modules that handle state, intelligence, and system interaction.

## 1. The Controller: `System` ([system.ts](file:///c:/simpleclaw/src/system.ts))
The `System` class is a **Singleton** that acts as the source of truth for the entire application.

- **Configuration**: Manages `config.json`. Tracks the `activeMode`, `primary` model, and the **Mechanical Summarizer Switch** (`summarizerEnabled`).
- **Secrets Management**: Safely loads and redacts API keys from the `env/` directory.
- **Model Discovery**: Features provider-aware logic for Ollama (local), OpenRouter, OpenAI, and HuggingFace. It probes endpoints and returns available model IDs for the UI.
- **Identity Synthesis**: Generates the initial system prompt by combining the base persona with a mode-specific **Lego Lane**.

## 2. The Brain: `Agent` ([agent.ts](file:///c:/simpleclaw/src/agent.ts))
The `Agent` class implements the **Think-Act-Observe (Re-Act)** loop.

- **Heartbeat Loop**: 
  - Each message turn can trigger up to 10 autonomous steps (5 in `eco`, 3 in `super-eco`).
  - **Think**: Sends the current context (Memory + Summary + LEGOs) to the LLM.
  - **Act**: Parses the response for `<EXEC>`, `<WRITE>`, `<READ>`, `<LIST>`, or `<GET_LEGO>` tags.
  - **Observe**: Executes the found tool and appends the raw output back into memory as a `system` role message for the next step.
- **Tiered Memory Compaction**:
  - **Trigger**: Every 5 user turns.
  - **Summarization**: Uses the primary (or dedicated) model to update a running `sessionSummary`.
  - **Pruning**: Memory is pruned to keep only the System Header, the Summary, and the last few message exchanges.
- **Isolation Protocol**: On session reset, usage stats are archived to `storage/sessions/` and memory is wiped to zero.

## 3. The Hands: `Toolbox` ([toolbox.ts](file:///c:/simpleclaw/src/toolbox.ts))
The `Toolbox` class is the interface between the AI and your operating system.

- **Auto-Discovery**: At startup, it scans `tools/` and `tools/temp/` for `.js` files. It reads the first line (comment) to build a "Tool Capabilities" list for the Agent.
- **Native Operations**:
  - `executeCommand`: Runs shell commands with an optional security allowlist.
  - `readTool / writeTool`: Direct file-system interaction restricted to the project root.
  - `listTool`: Directory traversal for identifying project assets.

## 🧱 Modular Instructions (LEGOs)
SimpleClaw uses a **Pull-based context system**. Instead of sending 2,000 tokens of "rules" every time:
1. The Agent starts with a **Lego Lane** (a list of available brick names).
2. If it needs deeper context (e.g., the `project_map` or complex `protocols`), it emits `<GET_LEGO name="x" />`.
3. The next step injects that specific instruction block into memory.
4. This ensures maximum clarity for the model and minimum cost for the user.

---
**Tip for Developers**: To add a new capability, create a `.js` file in `tools/` with a one-line comment at the top. The Agent will automatically discover it and understand when to use it! 🚀
