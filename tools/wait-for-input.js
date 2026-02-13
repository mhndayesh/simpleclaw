import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Waiting for input... (type something and press Enter)");
console.log("This will timeout after 5 seconds if no input received");

rl.question('Please enter your message: ', (answer) => {
  console.log('Received:', answer);
  rl.close();
});

// Timeout after 5 seconds
setTimeout(() => {
  console.log('Timeout - no input received');
  rl.close();
}, 5000);