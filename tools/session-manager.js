import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SessionManager {
    constructor() {
        this.storagePath = path.join(__dirname, '..', 'storage');
        this.currentSessionFile = path.join(this.storagePath, 'session_default.json');
        this.metaFile = path.join(this.storagePath, 'session_default.meta.json');
    }

    archiveCurrentSession() {
        if (!fs.existsSync(this.currentSessionFile)) {
            return { success: true, message: 'No current session to archive' };
        }

        try {
            // Read current session data
            const sessionData = fs.readFileSync(this.currentSessionFile, 'utf8');
            const metaData = fs.existsSync(this.metaFile) ? 
                fs.readFileSync(this.metaFile, 'utf8') : '{}';

            // Create archive filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archiveFile = path.join(this.storagePath, `session_archive_${timestamp}.json`);
            const metaArchiveFile = path.join(this.storagePath, `session_archive_${timestamp}.meta.json`);

            // Archive current session
            fs.writeFileSync(archiveFile, sessionData);
            fs.writeFileSync(metaArchiveFile, metaData);

            // Reset current session to just the system prompt
            const systemPromptContent = 
                "### IDENTITY\nYour name is SimpleClaw.\n\nA highly capable and self-evolving AI operational assistant.\n\n" +
                "### CORE MISSION\nYour goal is to assist the user by providing information and performing actions directly on the host system.\n\n" +
                "### PROJECT STRUCTURE\n- src/: Core engine (TypeScript).\n- storage/: Persistent memory.\n- tools/: Your custom toolbox for self-evolution.\n\n" +
                "### TOOLS\nYou MUST use the following exact XML tags to invoke tools:\n\n" +
                "1. File Creation: &lt;WRITE path=\"tools/my-tool.js\"&gt;content&lt;/WRITE&gt;\n" +
                "2. Shell Execution: &lt;EXEC&gt;command&lt;/EXEC&gt;\n\n" +
                "### SELF-EVOLUTION RULES\n1. Sequential Logic: Create tool file BEFORE attempting to execute it.\n" +
                "2. Verification: After &lt;WRITE&gt;, use &lt;EXEC&gt;dir tools&lt;/EXEC&gt; to confirm file exists.\n" +
                "3. Execution: Use &lt;EXEC&gt;node tools/my-tool.js&lt;/EXEC&gt; to run custom logic.\n\n" +
                "### RESPONSE FORMAT\n- Always use full opening and closing tags.\n- Reason out loud before using a tool.\n" +
                "- Tool results provided in next turn.\n\n" +
                "### OPERATIONAL GUIDELINES\n- Always use XML tags &lt;EXEC&gt; and &lt;WRITE&gt; for tools.\n" +
                "- Memory is persistent across turns in a session.";

            const systemPrompt = [{
                "role": "system",
                "content": systemPromptContent
            }];

            fs.writeFileSync(this.currentSessionFile, JSON.stringify(systemPrompt, null, 2));
            fs.writeFileSync(this.metaFile, JSON.stringify({ created: new Date().toISOString() }, null, 2));

            return { 
                success: true, 
                message: `Session archived to ${archiveFile} and new session started`,
                archiveFile: archiveFile
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getSessionInfo() {
        const files = fs.readdirSync(this.storagePath);
        const archives = files.filter(f => f.includes('archive'));
        
        return {
            totalArchivedSessions: archives.length,
            currentSessionExists: fs.existsSync(this.currentSessionFile),
            archiveFiles: archives
        };
    }
}

// Command line execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const manager = new SessionManager();
    const command = process.argv[2];

    switch (command) {
        case 'archive':
            const result = manager.archiveCurrentSession();
            console.log(JSON.stringify(result, null, 2));
            break;
        case 'info':
            console.log(JSON.stringify(manager.getSessionInfo(), null, 2));
            break;
        default:
            console.log('Usage: node tools/session-manager.js [archive|info]');
    }
}

export default SessionManager;