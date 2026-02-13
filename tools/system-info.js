import os from 'os';
import fs from 'fs';

console.log("=== SimpleClaw System Information ===");
console.log("Platform:", os.platform());
console.log("Architecture:", os.arch());
console.log("CPU Cores:", os.cpus().length);
console.log("Total Memory:", Math.round(os.totalmem() / (1024 * 1024 * 1024)) + " GB");
console.log("Free Memory:", Math.round(os.freemem() / (1024 * 1024 * 1024)) + " GB");
console.log("Uptime:", Math.round(os.uptime() / 60) + " minutes");
console.log("User:", os.userInfo().username);
console.log("Current Directory:", process.cwd());

// List available tools
console.log("\n=== Available Tools ===");
const tools = fs.readdirSync('tools');
tools.forEach(tool => {
    if (tool.endsWith('.js')) {
        console.log("-", tool);
    }
});

console.log("\nI'm ready to help with:");
console.log("- File operations (create, read, modify)");
console.log("- System commands and scripts");
console.log("- Custom tool development");
console.log("- Data processing");
console.log("- And much more!");