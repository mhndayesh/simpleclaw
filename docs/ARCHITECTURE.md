# SimpleClaw Architecture Reference

This document serves as the primary reference for the SimpleClaw agent's internal architecture, capabilities, and workflows.

## 1. Core System (`src/core/`)

- **Identity (`identity.ts`)**: Manages the system prompt, including "God Mode" status and Lego-based instructions.
- **Agent (`agent.ts`)**: The core engine. Manages conversation history, tiered summarization, and task loops.
- **LLM Context (`llm.ts`)**: Centralized LLM interaction with built-in **fallback logic** (Primary -> Fallback) and provider detection.
- **Security (`security.ts`)**:
  - **Modes**: Interactive (CLI) vs. Strict (Server).
  - **Toggle**: Can be disabled via `config.json` (`"security": { "enabled": false }`).
- **Config (`config.ts`)**: Manages `config.json` and the **Mechanical Summarizer Switch**.
- **Toolbox (`toolbox.ts`)**: Discovery and execution logic for all system and temporary tools.


## 2. Server & Lanes (`src/server.ts`)

The server uses a **Lane-based Command Queue** system:
- **Main Lane**: Synchronous execution.
- **Background Lane**: Asynchronous tasks (concurrency limit: 2).
  - Triggered via `<EXEC lane="background">`.

## 3. Tool Auto-Discovery (`tools/`)

- **Mechanism**: The agent scans `tools/*.js` at startup.
- **Registration**: Files are automatically added to the system prompt with their first-line description.
- **Standard Tools**:
  - `tools/browse.js`: Puppeteer-based headless browser. Usage: `node tools/browse.js <url> [screenshot_path]`.

## 4. Workspace Conventions

- **`saved_data/`**: Dedicated folder for all agent outputs (images, docs, reports).
- **`env/`**: Secrets storage (API keys).
- **`storage/`**: Session memory persistence.

## 5. Environment Variables

- `PORT`: Server port (default 3001).
- `OPENROUTER_API_KEY`: For OpenRouter access.
- `HF_TOKEN`: For HuggingFace access.

## 6. Memory & Summarization

- **Tiered Strategy**: summarization triggers every 5 turns.
- **Intensities**: 
  - `super-eco`: Pin-point (3 lines).
  - `eco`: Concise bullets (Issues/Solutions).
  - `standard`: Detailed bullets (Full logs).
- **Mechanical Switch**: Dedicated model compute for background tasks (`summarizerEnabled`).
- **Isolation**: Every reset archives to `storage/sessions` and wipes active memory.

