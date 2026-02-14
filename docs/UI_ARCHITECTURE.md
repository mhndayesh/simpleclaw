# Web UI Architecture: React + Vite 🎨

The SimpleClaw frontend is a high-performance Single Page Application (SPA) designed for "Vibe Coding" with a premium, developer-centric aesthetic.

## 🛠️ Tech Stack
- **Framework**: React 18+
- **Build Tool**: Vite (for ultra-fast HMR)
- **Styling**: Vanilla CSS (modularized) with Glassmorphism effects.
- **Icons**: Lucide React for consistent technical iconography.

## 🏗️ Component Structure
- **`App.jsx`**: The root container. Manages the global `activeTab` (Chat, Settings, Session) and handles the main `message` stream.
- **`SettingsTab.jsx`**: Interface for `System` configuration. Implements the **Mechanical Summarizer Switch** UI and API Key management.
- **`SessionArchive.jsx`**: Interface for browsing and restoring historical summaries from `storage/sessions/`.
- **`NeuralModeToggle`**: A specialized component that sends a `SYSTEM` update to the Backend whenever the mode is changed, ensuring synchronization between UI and API compaction logic.

## 🔄 Data Lifecycle & State
The UI uses **Stateful Hooks** to manage interactions:
1. **Initial Mount**: Calls `/api/setup-status`. If `false`, redirects to the Setup Wizard.
2. **Setup**: Collects API keys and model preferences, posting them to `/api/secrets` and `/api/config`.
3. **Operational**: 
   - Uses `useState` for the chat transcript.
   - Triggers `agent.chat()` via a POST to `/api/chat`.
   - Automatically scrolls to the bottom on new messages.
   - Redacts sensitive keys via the `/api/secrets` GET endpoint.

## 🛰️ Local Dev & Proxy
To avoid CORS issues during development, the `vite.config.ts` includes a proxy server:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```
- **Port 5173**: Vite Dev Server (Frontend).
- **Port 3001**: SimpleClaw Core (Backend).

## 📦 Production Build
Running `npm run build` in the `ui/` directory generates a minimized `dist/` folder. The Backend (`src/index.ts`) is configured to serve this folder statically, allowing the entire app to run on a single port (`3001`) in production.
