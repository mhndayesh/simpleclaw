import { handleModeChangeRequest, simulateModeChange } from './ui-mode-selector.js';

console.log("=== MODE SELECTOR INTEGRATION TEST ===\n");

// Test 1: Simulate UI mode changes
simulateModeChange();

console.log("\n" + "=".repeat(60));
console.log("🎯 TESTING MODE CHANGE REQUESTS");
console.log("=".repeat(60));

// Test 2: Manual mode change requests
const testRequests = [
    "SYSTEM: Change mode to SUPER-ECO",
    "SYSTEM: Change mode to STANDARD", 
    "SYSTEM: Change mode to FULL-CONTEXT",
    "SYSTEM: Change mode to INVALID-MODE", // Should fail
    "normal user request should not trigger mode change"
];

testRequests.forEach(request => {
    console.log(`\n📨 Request: "${request}"`);
    const result = handleModeChangeRequest(request);
    if (result) {
        console.log(`✅ Response: ${result}`);
    } else {
        console.log("✅ No mode change (normal request)");
    }
});

console.log("\n🎯 Mode selector is ready for UI integration!");