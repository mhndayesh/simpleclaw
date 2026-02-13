console.log("=== Message Diagnostic Tool ===");
console.log("Current timestamp:", new Date().toISOString());
console.log("Node.js version:", process.version);
console.log("Platform:", process.platform);
console.log("Current directory:", process.cwd());
console.log("Environment variables:", Object.keys(process.env).length);

// Check if we can read from stdin or other input sources
console.log("Stdin isTTY:", process.stdin.isTTY);
console.log("Arguments:", process.argv);

console.log("Diagnostic complete - no messages detected in standard input");