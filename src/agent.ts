import { System } from './system.js';
import { Toolbox } from './toolbox.js';
import { LLM, type Usage } from './llm.js';
import { legoRegistry } from './core/identity.js';
import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot } from './utils.js';


export class Agent {
    private system: System;
    private toolbox: Toolbox;
    private llm: LLM;
    private memory: { role: string, content: string }[] = [];
    private MAX_STEPS = 10; // Safety limit
    public sessionUsage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };
    private totalStepsTaken = 0;
    private sessionSummary = '';
    private conversationCount = 0;

    constructor() {
        this.system = System.getInstance();
        this.toolbox = new Toolbox();
        this.llm = new LLM();
        this.memory.push({ role: 'system', content: this.system.getIdentity() });
        this.ensureStorage();
    }

    private ensureStorage() {
        const sessionsDir = path.join(getProjectRoot(), 'storage', 'sessions');
        if (!fs.existsSync(sessionsDir)) {
            fs.mkdirSync(sessionsDir, { recursive: true });
        }
    }

    public async chat(userInput: string): Promise<{ response: string, usage: Usage }> {
        // 1. Update Memory
        this.memory.push({ role: 'user', content: userInput });

        // 2. Compaction & Summarization Trigger
        const mode = (this.system.config as any).activeMode || 'standard';
        this.conversationCount++;

        // Summarize every 5 requests
        if (this.conversationCount % 5 === 0 && this.memory.length > 5) {
            await this.summarizeHistory(mode);
        }

        // Keep memory concise: Keep the head (system), the summary (if exists), and the tail.
        if (this.memory.length > 10) {
            const head = this.memory[0]; // Original system identity
            const tail = this.memory.slice(-8); // Last few exchanges
            this.memory = head ? [head, ...tail] : tail;
        }


        let currentStep = 0;
        let stepsTaken = 0;
        let finalResponse = '';
        const totalUsage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };

        // 2. Autonomous Loop (Think -> Act -> Observe)
        let stepLimit = this.MAX_STEPS;
        if (mode === 'super-eco') stepLimit = 3;
        else if (mode === 'eco') stepLimit = 5;

        while (currentStep < stepLimit) {
            console.log(`[Agent] Step ${currentStep + 1}/${stepLimit} (Thinking...)`);



            // 3. Inject context (Conditional based on mode)
            let contextMsg: { role: string, content: string } | null = null;
            if (mode !== 'super-eco') {
                const tools = this.toolbox.getToolsList();
                const summaryMsg = this.sessionSummary ? `[SESSION SUMMARY]:\n${this.sessionSummary}\n\n` : '';
                contextMsg = {
                    role: 'system',
                    content: `[SYSTEM] Current Date: ${new Date().toISOString()}\n${summaryMsg}AVAILABLE TOOLS:\n${tools}\n\nINSTRUCTIONS: If the task is incomplete, use <EXEC> to run a tool. If done, provide the final answer without tags.`
                };
            } else {
                const summaryMsg = this.sessionSummary ? `[PINPOINT SUMMARY]:\n${this.sessionSummary}\n\n` : '';
                contextMsg = {
                    role: 'system',
                    content: `[SYSTEM] Current Date: ${new Date().toISOString()}\n${summaryMsg}Mode: SUPER-ECO. Use <GET_LEGO /> for instructions.`
                };
            }

            // Call LLM
            console.log('[Agent] Calling LLM...');
            const { content: response, usage } = await this.llm.chat([...this.memory, contextMsg]);


            // Accumulate usage
            totalUsage.inputTokens += usage.inputTokens;
            totalUsage.outputTokens += usage.outputTokens;
            totalUsage.totalTokens += usage.totalTokens;
            stepsTaken++;

            console.log(`[Agent] LLM Response (Full): ${response}`);
            this.memory.push({ role: 'assistant', content: response });

            // 4. Decide if we continue the autonomous loop
            const hasTags = response.includes('<EXEC') || response.includes('<WRITE') || response.includes('<GET_LEGO') || response.includes('<READ') || response.includes('<LIST');

            if (!hasTags && !process.env.ALWAYS_LOOP) {
                finalResponse = response;
                break;
            }


            // Execute Tool(s)
            let toolExecuted = false;
            let match;

            // Handle <EXEC> (Super Robust)
            const execRegex = /<EXEC\b([^>]*?)(?:\/>|>(.*?)<\/EXEC>)/gis;
            while ((match = execRegex.exec(response)) !== null) {
                toolExecuted = true;
                const attrStr = match[1] || '';
                let cmd = match[2] || '';

                // If empty cmd, check attributes (hallucination recovery)
                if (!cmd.trim()) {
                    const pathMatch = attrStr.match(/path="([^"]+)"/i);
                    const argsMatch = attrStr.match(/args="([^"]+)"/i);
                    if (pathMatch) {
                        cmd = `node ${pathMatch[1]} ${argsMatch ? argsMatch[1] : ''}`;
                    }
                }

                if (!cmd.trim()) continue;

                const result = await this.toolbox.executeCommand(cmd.trim());
                this.memory.push({ role: 'system', content: `[EXEC Output]:\n${result}` });
                console.log(`[Agent] Executed: ${cmd}`);
            }

            // Handle <WRITE> (Super Robust)
            const writeRegex = /<WRITE\b([^>]*?)>(.*?)<\/WRITE>/gis;
            while ((match = writeRegex.exec(response)) !== null) {
                toolExecuted = true;
                const attrStr = match[1] || '';
                const content = match[2] || '';
                const pathMatch = attrStr.match(/path="([^"]+)"/i);
                const filePath = pathMatch ? pathMatch[1] : null;

                if (!filePath || !content) continue;

                const result = await this.toolbox.writeTool(filePath, content);
                this.memory.push({ role: 'system', content: `[WRITE Output]:\n${result}` });
                console.log(`[Agent] Wrote to: ${filePath}`);
            }

            // Handle <GET_LEGO> (Super Robust)
            const legoRegex = /<GET_LEGO\b([^>]*?)(?:\/>|>(.*?)<\/GET_LEGO>)/gis;
            while ((match = legoRegex.exec(response)) !== null) {
                toolExecuted = true;
                const attrStr = match[1] || '';
                const nameMatch = attrStr.match(/name="([^"]+)"/i);
                const legoName = nameMatch ? nameMatch[1] : (match[2] || '').trim();

                if (!legoName) continue;

                const legoPath = legoRegistry[legoName];
                if (legoPath && fs.existsSync(legoPath)) {
                    const content = fs.readFileSync(legoPath, 'utf-8');
                    this.memory.push({ role: 'system', content: `[LEGO: ${legoName}]\n${content}` });
                    console.log(`[Agent] Provided LEGO: ${legoName}`);
                } else {
                    this.memory.push({ role: 'system', content: `[ERROR] LEGO "${legoName}" not found.` });
                    console.log(`[Agent] LEGO not found: ${legoName}`);
                }
            }

            // Handle <READ> (Super Robust)
            const readRegex = /<READ\b([^>]*?)(?:\/>|>(.*?)<\/READ>)/gis;
            while ((match = readRegex.exec(response)) !== null) {
                toolExecuted = true;
                const attrStr = match[1] || '';
                const pathMatch = attrStr.match(/path="([^"]+)"/i);
                const filePath = pathMatch ? pathMatch[1] : (match[2] || '').trim();

                if (!filePath) continue;

                const result = await this.toolbox.readTool(filePath);
                this.memory.push({ role: 'system', content: `[READ Output for ${filePath}]:\n${result}` });
                console.log(`[Agent] Read: ${filePath}`);
            }

            // Handle <LIST> (Super Robust)
            const listRegex = /<LIST\b([^>]*?)(?:\/>|>(.*?)<\/LIST>)/gis;
            while ((match = listRegex.exec(response)) !== null) {
                toolExecuted = true;
                const attrStr = match[1] || '';
                const pathMatch = attrStr.match(/path="([^"]+)"/i);
                const dirPath: string = (pathMatch ? pathMatch[1] : (match[2] || '').trim()) || '.';

                const result = await this.toolbox.listTool(dirPath);

                this.memory.push({ role: 'system', content: `[LIST Output for ${dirPath}]:\n${result}` });
                console.log(`[Agent] Listed: ${dirPath}`);
            }


            if (!toolExecuted) {
                // If it looked like it wanted to run something but didn't match regex, or just talked.
                finalResponse = response;
                break;
            }

            currentStep++;
        }

        if (currentStep >= this.MAX_STEPS) {
            finalResponse += "\n[System] Max autonomous steps reached. Halting.";
        }

        if (stepsTaken > 0) {
            totalUsage.avgTokens = Math.round(totalUsage.totalTokens / stepsTaken);
        }

        // Accumulate into session usage
        this.sessionUsage.inputTokens += totalUsage.inputTokens;
        this.sessionUsage.outputTokens += totalUsage.outputTokens;
        this.sessionUsage.totalTokens += totalUsage.totalTokens;
        this.totalStepsTaken += stepsTaken;

        if (this.totalStepsTaken > 0) {
            this.sessionUsage.avgTokens = Math.round(this.sessionUsage.totalTokens / this.totalStepsTaken);
        }

        return { response: finalResponse, usage: this.sessionUsage };
    }

    public async resetUsage() {
        // Archive the current session summary before clearing
        if (this.sessionSummary) {
            this.archiveSession();
        }

        this.sessionUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };
        this.totalStepsTaken = 0;
        this.conversationCount = 0;
        this.sessionSummary = '';
        this.memory = [{ role: 'system', content: this.system.getIdentity() }]; // Clear memory but keep identity
        console.log('[Agent] Session Reset: Archived current summary and cleared memory.');
    }

    private archiveSession() {
        try {
            const sessionsDir = path.join(getProjectRoot(), 'storage', 'sessions');
            const fileName = `session_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const filePath = path.join(sessionsDir, fileName);

            const sessionData = {
                timestamp: new Date().toISOString(),
                summary: this.sessionSummary,
                usage: this.sessionUsage,
                steps: this.totalStepsTaken
            };

            fs.writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
            console.log(`[Agent] Session archived to: ${fileName}`);
        } catch (error: any) {
            console.error(`[Agent] Archive failed: ${error.message}`);
        }
    }

    private async summarizeHistory(mode: string) {
        console.log(`[Agent] Summarizing history (Mode: ${mode})...`);
        let prompt = '';

        switch (mode) {
            case 'super-eco':
                prompt = "Pin-point summary of the session: Focus ONLY on errors, fixes, and final results. Use maximum 3 lines.";
                break;
            case 'eco':
                prompt = "Brief bullet point summary of the session: Issue faced, Solution applied, and Progress tracking. Keep it very concise.";
                break;
            case 'standard':
            default:
                prompt = "Detailed bullet point summary of the session: List issues, specific steps taken to fix them, and current status. Be thorough but efficient.";
                break;
        }

        const systemMsg = {
            role: 'system',
            content: `You are a memory compressor. Your goal is to append the new events to the existing summary.\nExisting Summary: ${this.sessionSummary || 'None'}\n\nInstruction: ${prompt}`
        };

        const useDedicated = (this.system.config as any).summarizerEnabled && (this.system.config as any).summarizer;
        const llmType = useDedicated ? 'summarizer' : 'primary';

        const { content: newSummary } = await this.llm.chat([
            systemMsg,
            ...this.memory.slice(-10), // Give it the recent history to digest
            { role: 'user', content: 'Update the session summary based on the history above.' }
        ], llmType);



        this.sessionSummary = newSummary;
        console.log(`[Agent] Summary Updated: ${this.sessionSummary.substring(0, 50)}...`);
    }
}
