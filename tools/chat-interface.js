import { setMode, processRequest, getAvailableModes } from './mode-manager.js';
import readline from 'readline';

// Create interactive interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class ChatInterface {
    constructor() {
        this.currentMode = 'super-eco';
        this.showModeSelector();
    }
    
    showModeSelector() {
        console.log('\n🎛️  SELECT CHAT MODE:');
        console.log('='.repeat(40));
        
        const modes = getAvailableModes();
        modes.forEach((mode, index) => {
            console.log(`${index + 1}. ${mode.name}`);
            console.log(`   ${mode.description}`);
        });
        
        console.log('='.repeat(40));
        this.promptModeSelection();
    }
    
    promptModeSelection() {
        rl.question('\nSelect mode (1-3) or press Enter for Super Eco: ', (answer) => {
            const modeChoice = parseInt(answer) || 1;
            const modeKeys = ['super-eco', 'standard', 'full-context'];
            
            if (modeChoice >= 1 && modeChoice <= 3) {
                this.currentMode = modeKeys[modeChoice - 1];
                setMode(this.currentMode);
                console.log(`\n✅ Selected: ${getAvailableModes()[modeChoice - 1].name}`);
                this.startChat();
            } else {
                console.log('Using default: 🟢 Super Eco Mode');
                this.startChat();
            }
        });
    }
    
    startChat() {
        console.log('\n💬 CHAT STARTED (type "exit" to quit, "mode" to change mode)');
        console.log('-'.repeat(50));
        this.promptMessage();
    }
    
    promptMessage() {
        rl.question('\nYou: ', async (message) => {
            if (message.toLowerCase() === 'exit') {
                console.log('Goodbye! 👋');
                rl.close();
                return;
            }
            
            if (message.toLowerCase() === 'mode') {
                this.showModeSelector();
                return;
            }
            
            // Process the message
            const aiPayload = processRequest(message);
            
            console.log('\n🔁 Sending to AI:');
            console.log('─'.repeat(30));
            console.log(aiPayload);
            console.log('─'.repeat(30));
            console.log(`📊 Token estimate: ${aiPayload.length} chars (~${Math.ceil(aiPayload.length/4)} tokens)`);
            
            // Simulate AI response
            console.log('\n🤖 AI Response:');
            console.log('─'.repeat(30));
            console.log(`Processing your request in ${this.currentMode} mode...`);
            console.log('─'.repeat(30));
            
            this.promptMessage();
        });
    }
}

// Start the chat interface
new ChatInterface();