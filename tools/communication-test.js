import fs from 'fs';

// Create a communication file
const timestamp = new Date().toISOString();
const message = `Test message at ${timestamp}`;

fs.writeFileSync('tools/communication.txt', message);
console.log('Message written to communication.txt:', message);