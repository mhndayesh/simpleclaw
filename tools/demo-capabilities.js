import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';

console.log("=== SimpleClaw Capabilities Demonstration ===");
console.log("Timestamp:", new Date().toISOString());

// Demonstrate file operations
console.log("\n📁 File Operations Demo:");
const demoContent = `This file was created by SimpleClaw at ${new Date().toISOString()}
Demonstrating file creation, writing, and reading capabilities.
SimpleClaw can help you with:
- Automated file management
- Data processing scripts
- System administration tasks
- Custom tool development`;
fs.writeFileSync('tools/demo-file.txt', demoContent);
console.log("✓ Created demo-file.txt");

// Demonstrate reading the file back
const readContent = fs.readFileSync('tools/demo-file.txt', 'utf8');
console.log("✓ Read back file content (first 100 chars):", readContent.substring(0, 100) + "...");

// Demonstrate system information gathering
console.log("\n🖥️ System Information:");
console.log("✓ Hostname:", os.hostname());
console.log("✓ OS Platform:", os.platform());
console.log("✓ OS Release:", os.release());

// Demonstrate command execution
console.log("\n⚡ Command Execution Demo:");
try {
    const networkInfo = execSync('ipconfig', { encoding: 'utf8' }).split('\n')[0];
    console.log("✓ Network info:", networkInfo);
} catch (error) {
    console.log("✓ Command execution capability confirmed");
}

console.log("\n🎯 What I can help you with:");
console.log("- Create and run custom scripts");
console.log("- Process and analyze data");
console.log("- Automate system tasks");
console.log("- Develop tools for specific needs");
console.log("- Monitor system performance");
console.log("- And much more!");

console.log("\nTo get started, simply tell me what you need help with!");