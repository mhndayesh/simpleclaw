# CLI Reference Guide

SimpleClaw provides a powerful Command Line Interface (CLI) for managing models and sessions directly from your terminal.

## Using the Wrapper
On Windows, use the `simpleclaw.bat` file in the root directory:
```batch
simpleclaw <command> [options]
```

## Commands

### `list`
Discovers and lists all models from all configured providers.
- **Example**: `simpleclaw list`

### `config`
View or update your primary and fallback model preferences.
- **Options**:
  - `--primary <id>`: Set the primary model ID.
  - `--fallback <id>`: Set the fallback model ID.
- **Example**: `simpleclaw config --primary llama3.1`

### `chat`
Start a chat session with an AI model.
- **Options**:
  - `-q, --query <text>`: **(Required)** The message to send.
  - `-m, --model <id>`: Specific model ID to use (overrides config).
  - `-s, --session <id>`: Session ID for memory persistence (default: "default").
- **Example**: `simpleclaw chat -q "How are you?" -m gpt-4o`

### `clear <session>`
Completely wipes the history and metadata for a specific session ID.
- **Example**: `simpleclaw clear my-session-1`

### `setup`
Resets the "Setup Complete" flag in [config.json](file:///c:/simpleclaw/config.json).
- **Behavior**: The next time you open the Web UI, you will be forced to re-run the configuration wizard.
- **Example**: `simpleclaw setup`

## Tips
- Use the **Session ID** (`-s`) to maintain long-running context over multiple CLI calls.
- SimpleClaw's CLI supports the same **Tool Loop** as the Web UI; you can ask the assistant to write files or run commands directly from the terminal!
