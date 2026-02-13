# Web UI Architecture

The SimpleClaw Web Interface is a modern, single-page application built with **React** and **Vite**.

## Core Components

### 1. `App.jsx`
The central hub for the chat experience. 
- **State Management**: Handles active session history, usage tracking, and model selection.
- **Neural Mode Selector**: Allows users to switch between `super-eco`, `standard`, and `full-context` on the fly.
- **Chat Interface**: A responsive, message-based UI with support for markdown rendering and tool execution logs.

### 2. `SetupWizard.jsx`
A dedicated experience for first-time users (or after running `simpleclaw setup`).
- **Provider Checklist**: Verifies API keys and local Ollama availability.
- **Initial Config**: Guides the user through selecting their primary and fallback models.

## Communication Logic
The frontend communicates with the [Express Backend](file:///c:/simpleclaw/src/server.ts) primarily via the `/api` routes.
- **Polling**: The UI uses standard fetching to retrieve session updates and configuration.
- **Auto-Sync**: When a user changes the Neural Mode in the UI, it sends a `SYSTEM` command to the backend to ensure the API's memory compaction logic stays in sync.

## Styling
- **CSS**: Uses a modular CSS approach with `App.css` and `index.css`.
- **Aesthetics**: Focused on a clean, developer-centric dark theme with high-contrast accents and professional typography.

## Development
To modify the UI:
1. Navigate to the `ui/` directory.
2. Run `npm install`.
3. Run `npm run dev` to start the Vite HMR server.
