# SimpleClaw API Reference

SimpleClaw exposes a RESTful API on port `3001` (by default) that powers both the CLI and the Web UI.

## Authentication
The API currently operates locally and does not require a separate auth token. API keys for providers are managed via the `/api/secrets` endpoint.

## Endpoints

### Models
- **GET `/api/models`**: List all models from all active providers.
  - *Response*: Array of `ModelMetadata` (id, name, provider).

### Configuration
- **GET `/api/config`**: Get the current global [config.json](file:///c:/simpleclaw/config.json).
- **POST `/api/config`**: Update configuration settings.
  - *Body*: `AppConfig` object.

### Secrets (API Keys)
- **GET `/api/secrets`**: Get redacted API keys for display in UI.
- **POST `/api/secrets`**: Update API keys.
  - *Body*: `{ "openrouter": "...", "hf": "..." }`. Keys are stored in the `env/` directory.

### Session Management
- **GET `/api/session?session=id`**: Get history, current mode, and usage stats for a session.
- **POST `/api/session/new`**: Archives the current session and resets it to a clean state.
  - *Body*: `{ "session": "id" }`.

### The Chat Engine
- **POST `/api/chat`**: The primary endpoint for AI interaction.
  - *Body*: `{ "query": "...", "model": "...", "session": "..." }`.
  - *Features*:
    - **Request Queuing**: Serializes requests per session to prevent race conditions.
    - **Smart Sanitization**: Strips internal tags (`<EXEC>`, `<WRITE>`, `<thinking>`, etc.) from the response content before returning it.
    - **Background Task Reporting**: Automatically reports results of finished background tasks at the start of next interaction.
    - **Tool Loop**: Automatically processes `<EXEC>`, `<WRITE>`, and `<BACKGROUND_EXEC>` commands.
    - **Auto-Sync**: Synchronizes system prompts if a mode change is detected in the query.

## Neural Mode Behaviors
The API adjusts its behavior based on the `mode` stored in session metadata:

| Mode | Max Turns | Memory Compaction |
| :--- | :--- | :--- |
| `super-eco` | 1 | Aggressive (Keep 3 user turns) |
| `standard` | 5 | Balanced (Keep 10 user turns) |
| `full-context` | 10 | None (Full history sent) |
