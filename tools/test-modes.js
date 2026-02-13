import { setMode, processRequest, getAvailableModes, MODES } from './mode-manager.js';

console.log("=== MODE SELECTOR DEMO ===\n");

// Show available modes
console.log("Available Modes:");
getAvailableModes().forEach(mode => {
    console.log(`- ${mode.name}: ${mode.description}`);
});

console.log("\n" + "=".repeat(50));

// Test Super Eco Mode
console.log("\n🟢 TESTING SUPER ECO MODE:");
setMode('super-eco');

const testRequests = [
    "What is your name?",
    "Create a tool for file operations",
    "Explain token economy",
    "Show me the modes",
    "Archive this session"
];

testRequests.forEach((request, index) => {
    console.log(`\nRequest ${index + 1}: "${request}"`);
    
    const aiPayload = processRequest(request);
    console.log("Payload to AI:");
    console.log(aiPayload);
    console.log(`Token estimate: ${aiPayload.length} chars`);
});

console.log("\n" + "=".repeat(50));

// Test Standard Mode
console.log("\n🔵 TESTING STANDARD MODE:");
setMode('standard');

const standardPayload = processRequest("Show tools and context");
console.log("Payload to AI:");
console.log(standardPayload);
console.log(`Token estimate: ${standardPayload.length} chars`);