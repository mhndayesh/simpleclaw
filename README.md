# SimpleClaw 🦞

> [!IMPORTANT]
> **VIBE CODED DISCLAIMER**: This project is built by an average person using "Vibe Coding" principles. It works, it evolves, and it is powerful—but it is NOT examples of "top-tier engineering." Expect rough edges, experimental logic, and a focus on "getting it done" over architectural perfection. 🌊🧪

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.2.0-blue?style=for-the-badge&logo=github" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/Status-Production--Ready-orange?style=for-the-badge" alt="Production Ready">
</div>

<br />

## 🧬 Self-Mutation & Evolution
SimpleClaw is unique: it is designed to **evolve itself**. Unlike static assistants, SimpleClaw has direct write-access to its own soul (source code).

- **What it is**: The Agent can rewrite its TypeScript backend, React frontend, and Tool registry in real-time.
- **How it works**: Using the `<WRITE>` protocol, the AI emits raw code chunks which are instantly saved to the filesystem, and the dev server (Vite/TS) hot-reloads the changes.
- **Why it matters**: Self-healing (fixing its own bugs), Feature Expansion (building its own tools), and UI Personalization.
- **How to trigger**: Simply ask it. *"Rewrite the Chat component to be glassmorphic"* or *"Add a new API endpoint for X"*.

> [!CAUTION]
> **UNRESTRICTED POWER**: SimpleClaw is a self-evolving AI chassis. Safety rails are almost non-existent by design. It can and will rewrite its own source if commanded. Use with extreme caution.

---

SimpleClaw is a minimalist, local-first, **Vibe Coded** AI operational assistant. It serves as a unified gateway to local models (via **Ollama**) and remote providers (**OpenAI, OpenRouter, HuggingFace**), providing both a Command Line Interface (CLI) and a modern Web UI.

Built with a focus on **portability** and **self-evolution**, SimpleClaw allows you to manage AI interactions with ease while keeping your data under your control.

---


## 🧠 Neural Modes
Choose the profile that fits your specific operational needs:

| Mode | Alias | Focus | Prompt Injection | Token Est. | Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |

- **On-Demand Loading**: Use `<GET_LEGO name="bricks_name" />` to load specific instruction blocks.
- **Available Bricks**: `core_persona`, `toolbox`, `project_map`, `protocols`.
- **Dynamic Context**: This keeps the AI focused, fast, and extremely cost-effective.

---

## 🚀 Key Features (v1.2.0)

- **🔘 Mechanical Summarizer Switch**: Explicitly toggle between primary and dedicated models for background tasks to optimize compute.
- **🧱 Tiered Memory Summarization**: Mode-specific summarization triggers every 5 turns for maximum token efficiency.
- **🛡️ Passive Isolation**: Every session starts with a clean slate; archives are kept in `storage/sessions/` for opt-in retrieval only.
- **🚥 Request Queuing**: Serializes chat requests per session to prevent race conditions.
- **🛰️ Background Tasks**: Support for non-blocking command execution with asynchronous result reporting.
- **🔍 Advanced Search**: Integrated codebase search with support for file extensions and content grepping.
- **Portability First**: Absolute path-agnostic architecture—run SimpleClaw from any folder.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **npm / pnpm**: Latest
- **Ollama**: (Optional) For local model support

### Installation
SimpleClaw is calibrated with a single command:

1. Clone or download the repository.
2. Run the setup script:
   ```batch
   setup.bat
   ```
*This will install dependencies, recalibrate paths, build the project, and launch the UI.*

---

## 📖 Usage

### Web UI
Launch at `http://localhost:3000` (proxied via Vite).
- **Settings**: Manage API keys and Neural Configuration.
- **Mechanical Control**: Toggle the dedicated summarizer engine with one click.

### CLI
Interact directly from the terminal:
```batch
simpleclaw chat -m llama3.1 -q "Status report"
simpleclaw list
```

---

## 🏗️ Architecture
- **Backend**: Node.js & Express (TypeScript)
- **Frontend**: React & Vite
- **Data**: Transparent JSON-based storage (no cloud DB required).

## 🙏 Acknowledgments
SimpleClaw is proudly inspired by **[OpenClaw](https://github.com/openclaw/openclaw)**. We thank the community for their pioneering work.

**Contact**: [mhndayesh@gmail.com](mailto:mhndayesh@gmail.com)


