# SimpleClaw Architecture Reference

This document serves as the primary reference for the SimpleClaw agent's internal architecture, capabilities, and workflows.

## 1. Core System (`src/core/`)

- **Identity (`identity.ts`)**: Manages the system prompt, including "God Mode" status and tool auto-discovery.
- **Memory (`memory.ts`)**: Handles conversation history and per-session storage.
- **LLM Service (`llm-service.ts`)**: Centralized LLM interaction with built-in **fallback logic** (Primary -> Fallback).
- **Security (`security.ts`)**:
  - **Modes**: Interactive (CLI) vs. Strict (Server).
  - **Toggle**: Can be disabled via `config.json` (`"security": { "enabled": false }`).
- **Config (`config.ts`)**: Manages `config.json` preferences.
- **Tools (`tools.ts`)**: XML parsing and execution logic for `<EXEC>` and `<WRITE>`.

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

## 6. Context Guard

- A tokenizer-based guard ensures conversation history stays within safe limits (token window management).
