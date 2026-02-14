
import { Agent } from '../dist/agent.js';
import { System } from '../dist/system.js';

async function testSummarization() {
    console.log('\n--- TESTING TIERED SUMMARIZATION ---');
    const system = System.getInstance();

    // We will simulate 6 turns to trigger the 5th-turn summary.
    async function runScenario(mode) {
        console.log(`\n>> Testing Mode: ${mode.toUpperCase()}`);
        system.config.activeMode = mode;
        const agent = new Agent();

        for (let i = 1; i <= 6; i++) {
            console.log(`Turn ${i}: Sending request...`);
            const res = await agent.chat(`Message ${i}: This is Turn ${i}. Today we are testing memory compression.`);

            // On turn 5, we should see the "[Agent] Summarizing history" log.
            // On turn 6, the context should contain the summary.
            if (i === 6) {
                console.log(`Agent Final Response (Turn 6): ${res.response.substring(0, 100)}...`);
            }
        }
    }

    await runScenario('super-eco');
    await runScenario('eco');
    await runScenario('standard');
}

testSummarization().catch(console.error);
