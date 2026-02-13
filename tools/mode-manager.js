import fs from 'fs';

// Available modes
const MODES = {
    'super-eco': {
        name: '🟢 Super Eco Mode',
        description: 'Minimal tokens: Only last 5 requests summarized, no tools sent unless requested',
        color: '\x1b[32m', // Green
        maxContextRequests: 3,
        includeTools: false,
        tokenBudget: 50
    },
    'standard': {
        name: '🔵 Standard Mode', 
        description: 'Balanced: Moderate context with tool definitions',
        color: '\x1b[34m', // Blue
        maxContextRequests: 10,
        includeTools: true,
        tokenBudget: 200
    },
    'full-context': {
        name: '🔴 Full Context Mode',
        description: 'Maximum context: Full history with all tools',
        color: '\x1b[31m', // Red
        maxContextRequests: 50,
        includeTools: true,
        tokenBudget: 1000
    }
};

let currentMode = 'super-eco';
let currentSession = [];
let requestCount = 0;

function setMode(modeName) {
    if (MODES[modeName]) {
        currentMode = modeName;
        console.log(`${MODES[modeName].color}Mode set to: ${MODES[modeName].name}\x1b[0m`);
        return true;
    }
    return false;
}

function processRequest(userRequest, includeTools = false) {
    requestCount++;
    
    currentSession.push({
        id: requestCount,
        content: userRequest,
        timestamp: new Date().toISOString()
    });
    
    const mode = MODES[currentMode];
    const aiInput = generateAIPayload(userRequest, mode, includeTools);
    
    // Archive every 5 requests in eco mode
    if (currentMode === 'super-eco' && requestCount % 5 === 0) {
        archiveSession();
    }
    
    return aiInput;
}

function generateAIPayload(userRequest, mode, includeTools) {
    let payload = [];
    
    // Add recent context based on mode
    const contextRequests = currentSession.slice(-mode.maxContextRequests);
    if (contextRequests.length > 0) {
        const contextSummary = contextRequests.map(req => 
            `[${req.id}] ${extractKeyPoints(req.content)}`
        ).join(' | ');
        payload.push(`Context: ${contextSummary}`);
    }
    
    // Add current request
    payload.push(`Current: ${userRequest}`);
    
    // Add tools only if requested or mode allows
    if (includeTools || mode.includeTools) {
        payload.push('Tools: WRITE, EXEC available');
    }
    
    return payload.join('\n');
}

function extractKeyPoints(content) {
    const words = content.split(' ').slice(0, 10);
    return words.join(' ');
}

function archiveSession() {
    const filename = `storage/session-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify({
        mode: currentMode,
        requests: currentSession,
        summary: generateAIPayload('Session archived', MODES[currentMode], false)
    }, null, 2));
}

function getAvailableModes() {
    return Object.values(MODES).map(mode => ({
        name: mode.name,
        description: mode.description
    }));
}

export { setMode, processRequest, getAvailableModes, MODES };