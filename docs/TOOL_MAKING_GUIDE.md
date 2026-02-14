# AI Tool-Making Guide

This guide is for SimpleClaw assistants. Follow these rules when asked to create or modify tools in the `/tools` directory.

## 1. ESM Protocol (CRITICAL)
SimpleClaw is an **ES Module (ESM)** project (`"type": "module"`).
- **DO NOT** use `require()` or `module.exports`.
- **DO USE** `import` and `export`.
- Files created with `.js` extension are treated as ESM.
- If you must use CommonJS, use the `.cjs` extension.

### Example (Correct ESM):
```javascript
import fs from 'fs';
import os from 'os';

console.log('System Uptime:', os.uptime());
```

## 2. Dependency Management
- Check `package.json` for available dependencies (e.g., `axios`, `chalk`).
- If you need a new dependency, ask the user or use `<EXEC>npm install <package></EXEC>`.

## 3. Path Handling
- Always use absolute paths or paths relative to the project root.
- Use the `tools/` directory for your helper scripts.

## 4. Error Handling
- Wrap complex logic in `try/catch` blocks.
- Provide clear error messages to the console for easier debugging by the system.

## 5. Persistence
- Use `storage/` for any data you need to persist between tool executions.

---
*Reference: docs/TOOL_MAKING_GUIDE.md*
