import { setMode, getAvailableModes, MODES } from './mode-manager.js';

// HTML/CSS for the mode selector UI
const MODE_SELECTOR_HTML = `
<div id="mode-selector" style="
    position: fixed;
    top: 10px;
    right: 10px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px;
    z-index: 1000;
    font-family: Arial, sans-serif;
    color: white;
    min-width: 250px;
">
    <h3 style="margin: 0 0 10px 0; color: #00ff00;">🟢 Mode Selector</h3>
    
    <select id="mode-dropdown" style="
        width: 100%;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #555;
        background: #2a2a2a;
        color: white;
        margin-bottom: 10px;
    ">
        <option value="super-eco">🟢 Super Eco Mode</option>
        <option value="standard">🔵 Standard Mode</option>
        <option value="full-context">🔴 Full Context Mode</option>
    </select>
    
    <div id="mode-description" style="
        font-size: 12px;
        color: #ccc;
        margin-bottom: 10px;
        padding: 8px;
        background: #2a2a2a;
        border-radius: 4px;
    ">
        Minimal tokens: Only last 3 requests summarized, no tools sent unless requested
    </div>
    
    <button id="apply-btn" style="
        width: 100%;
        padding: 8px;
        background: #00aa00;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    ">Apply Mode</button>
</div>
`;

// Function to handle mode change requests
function handleModeChangeRequest(userRequest) {
    if (userRequest.includes('SYSTEM: Change mode to')) {
        const modeName = userRequest.toLowerCase().replace('system: change mode to', '').trim();
        
        if (setMode(modeName)) {
            const mode = MODES[modeName];
            return `${mode.color}Mode changed to ${mode.name}\x1b[0m\nReady for your requests!`;
        } else {
            return "❌ Invalid mode. Available modes: super-eco, standard, full-context";
        }
    }
    return null; // Not a mode change request
}

// Demo function to simulate UI interaction
function simulateModeChange() {
    console.log("\n" + "=".repeat(60));
    console.log("🎯 MODE SELECTOR DEMO - Simulating UI Interaction");
    console.log("=".repeat(60));
    
    // Simulate user selecting a mode
    const testModes = ['super-eco', 'standard', 'full-context'];
    
    testModes.forEach(mode => {
        console.log(`\n🧪 Testing mode change to: ${mode}`);
        const mockRequest = `SYSTEM: Change mode to ${mode.toUpperCase()}`;
        const result = handleModeChangeRequest(mockRequest);
        console.log(result);
    });
}

export { handleModeChangeRequest, simulateModeChange, MODE_SELECTOR_HTML };