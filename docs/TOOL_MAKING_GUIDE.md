# AI Tool-Making Guide: Self-Evolution Protocol 🧬

This guide defines the standards for creating and modifying tools within the SimpleClaw ecosystem. Follow these strictly to ensure the Assistant can discover and use your contributions.

## 1. The Discovery Mechanism
SimpleClaw uses **Auto-Discovery** for its toolbox. 
- **Location**: All persistent tools MUST be placed in `tools/*.js`.
- **Registration**: The `Toolbox` class (in `src/toolbox.ts`) scans the directory at startup.
- **Description**: The first line of your script MUST be a comment (e.g., `// This tool does X`). This description is what the AI "sees" in its tool list.

## 2. ESM Protocol (Required)
The project uses **ES Modules**.
- **Extension**: `.js` (processed as ESM due to `"type": "module"` in `package.json`).
- **Standard**: Use `import/export`. Never use `require/module.exports`.

## 3. Tool Template
```javascript
// [NAME]: [DESCRIPTION FOR THE AI]
// Example: // file-meta: Analyzes file size and modification dates.

import fs from 'fs';
import path from 'path';

// 1. Process arguments from the shell
const targetPath = process.argv[2] || '.';

// 2. Wrap logic in a try-catch for stable system logs
try {
    const stats = fs.statSync(targetPath);
    console.log(JSON.stringify({
        path: targetPath,
        size: stats.size,
        modified: stats.mtime
    }, null, 2));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}
```

## 4. Environment Context
- **Working Directory**: The Agent always executes tools from the **Project Root**.
- **Utilities**: You can import logic from `dist/utils.js` if needed (requires the project to be built).
- **Security**: If the `Security Toggle` is ON, only commands starting with `node tools/` are allowed.

## 5. Ephemeral Tools
If the AI creates a tool specifically for a single session, it should place it in `tools/temp/`. These are automatically cleared by the `System` class periodically to keep the workspace clean.

---
**Protocol Message**: "I am a self-evolving system. If I am missing a capability, I will create it." 🦞
