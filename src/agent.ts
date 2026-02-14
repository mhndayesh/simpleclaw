import { System } from './system.js';
import { Toolbox } from './toolbox.js';
import { LLM, type Usage } from './llm.js';
import { getProjectRoot } from './utils.js';

export class Agent {
    private system: System;
    private toolbox: Toolbox;
    private llm: LLM;
    private memory: { role: string, content: string }[] = [];
    private MAX_STEPS = 10; // Safety limit
    public sessionUsage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };
    private totalStepsTaken = 0;

    constructor() {
        this.system = System.getInstance();
        this.toolbox = new Toolbox();
        this.llm = new LLM();
        this.memory.push({ role: 'system', content: this.system.getIdentity() });
    }

    public async chat(userInput: string): Promise<{ response: string, usage: Usage }> {
        // 1. Update Memory
        this.memory.push({ role: 'user', content: userInput });

        let currentStep = 0;
        let stepsTaken = 0;
        let finalResponse = '';
        const totalUsage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };

        // 2. Autonomous Loop (Think -> Act -> Observe)
        while (currentStep < this.MAX_STEPS) {
            console.log(`[Agent] Step ${currentStep + 1}/${this.MAX_STEPS} (Thinking...)`);

            // Inject available tools every turn to ensure context
            const tools = this.toolbox.getToolsList();
            const contextMsg = {
                role: 'system',
                content: `[SYSTEM] Current Date: ${new Date().toISOString()}\nAVAILABLE TOOLS:\n${tools}\n\nINSTRUCTIONS: If the task is incomplete, use <EXEC> to run a tool. If done, provide the final answer without tags.`
            };

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

            // Allow immediate return if no tool is used (Conversational)
            if (!response.includes('<EXEC>') && !process.env.ALWAYS_LOOP) {
                finalResponse = response;
                break;
            }

            // Execute Tool(s)
            let toolExecuted = false;
            let match;

            // Handle <EXEC>
            const execRegex = /<EXEC>(.*?)<\/EXEC>/gs;
            while ((match = execRegex.exec(response)) !== null) {
                toolExecuted = true;
                const cmd = match[1];
                if (!cmd) continue;

                const result = await this.toolbox.executeCommand(cmd);
                this.memory.push({ role: 'system', content: `[EXEC Output]:\n${result}` });
                console.log(`[Agent] Executed: ${cmd}`);
            }

            // Handle <WRITE>
            const writeRegex = /<WRITE path="(.*?)">([\s\S]*?)<\/WRITE>/gs;
            while ((match = writeRegex.exec(response)) !== null) {
                toolExecuted = true;
                const filePath = match[1];
                const content = match[2];

                if (!filePath || !content) continue;

                const result = await this.toolbox.writeTool(filePath, content);
                this.memory.push({ role: 'system', content: `[WRITE Output]:\n${result}` });
                console.log(`[Agent] Wrote to: ${filePath}`);
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

    public resetUsage() {
        this.sessionUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, avgTokens: 0 };
        this.totalStepsTaken = 0;
    }
}
