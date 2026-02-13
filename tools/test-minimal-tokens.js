import { processRequest, generateMinimalSummary } from './session-manager.js';

// Test the minimal token approach
const testRequests = [
    "What is your name and capabilities?",
    "Create a Python script for prime numbers",
    "Explain the WRITE tag usage",
    "Difference between EXEC and WRITE tags",
    "Summarize our session so far",
    "What's the current date and time?",
    "Create uppercase conversion tool",
    "How to use fs module in Node.js",
    "Summarize session again",
    "Purpose of WRITE tag"
];

console.log("=== MINIMAL TOKEN DEMONSTRATION ===\n");

testRequests.forEach((request, index) => {
    console.log(`Request ${index + 1}: "${request}"`);
    
    const aiInput = processRequest(request);
    console.log(`Sent to AI: "${aiInput}"`);
    console.log(`Token reduction: ${request.length} → ${aiInput.length} chars\n`);
});

console.log("=== SESSION SUMMARY ===");
console.log(generateMinimalSummary());