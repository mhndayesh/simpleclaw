# Introduction to SimpleClaw

SimpleClaw was born from a simple need: **A portable, lightweight, Vibe Coded AI bridge that stays out of your way.**

Inspired by the powerful capabilities of **OpenClaw**, SimpleClaw was designed to distill those advanced concepts into a streamlined, user-friendly experience that works right out of the box.


## 🧬 Project Philosophy

### 1. Fundamental Evolution
SimpleClaw is built with the radical idea of **Active Self-Mutation**. Unlike static applications, SimpleClaw can evolve its own logic based on your requests.
- **Dynamic Tooling**: Ask for a feature, and the AI can write and integrate a new script into its `/tools` directory immediately.
- **Source Code Autonomy**: The assistant has the permission and capability to modify the TypeScript files in `src/` and the React code in `ui/`. 
- **The Catch**: This level of freedom means traditional safety guardrails are stripped away to allow for maximum growth. It is fundamentally **dangerous** code. When you ask SimpleClaw to change itself, you are in the driver's seat of an experimental engine with no brakes.

### 2. Zero Friction
The barrier to entry should be non-existent. Our `setup.bat` doesn't just install packages; it initializes the entire environment, making the software ready to use in seconds.

### 3. Path Awareness
Traditional apps break when moved. SimpleClaw uses a **Root Calibration** system. When you run setup, the app "looks around," finds where it is sitting on your hard drive, and locks that path into its configuration. Every tool and memory file remains reachable regardless of the folder path.

### 4. Modularity
The codebase is separated into:

- **Providers**: Pluggable modules for different AI backends.
- **Core Engine**: Handles session memory, identity prompts, and tool execution.
- **The CLI/UI Pair**: Two interfaces consuming the exact same API.

## 🧱 The Build System

SimpleClaw is a TypeScript project that compiles down to high-performance JavaScript. 
- The **Engine** (`src/`) is compiled into `dist/`.
- The **UI** (`ui/`) is a Vite project that proxies its requests to the local backend.
- The **Tools** (`tools/`) are dynamic scripts that the assistant can create and execute on the fly.

## 🛣️ Roadmap

- **Plugin System**: Allow users to add their own custom provider logic.
- **Image Support**: Integration for multi-modal local models.
- **Streaming**: Implementation of Server-Sent Events (SSE) for faster response feel.

SimpleClaw isn't just a tool; it's a foundation for building your own personal AI operational center. 🦞
