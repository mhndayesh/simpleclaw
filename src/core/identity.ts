import * as fs from 'fs';
import * as path from 'path';
import { getProjectRoot } from './paths.js';

export interface AgentIdentity {
    name: string;
    persona: string;
}

const LEGO_DIR = path.join(getProjectRoot(), 'docs', 'legos');

export const legoRegistry: Record<string, string> = {
    'core_persona': path.join(LEGO_DIR, 'core_persona.md'),
    'toolbox': path.join(LEGO_DIR, 'toolbox.md'),
    'project_map': path.join(LEGO_DIR, 'project_map.md'),
    'protocols': path.join(LEGO_DIR, 'protocols.md')
};

export const defaultIdentity: AgentIdentity = {
    name: 'SimpleClaw',
    persona: 'A modular and self-evolving AI operational assistant.'
};

export function getSystemPrompt(mode: string = 'standard', identity: AgentIdentity = defaultIdentity): string {
    const projectRoot = getProjectRoot();
    const availableLegos = Object.keys(legoRegistry).map(k => `- \`${k}\``).join('\n');

    // 1. Determine Security Status
    let securityStatus = 'ACTIVE';
    try {
        const configPath = path.join(projectRoot, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (config.security?.enabled === false) securityStatus = 'DISABLED (GOD MODE)';
        }
    } catch { }

    // 2. Base Header
    const header = [
        `### SimpleClaw System Prompt [MODE: ${mode.toUpperCase()}]`,
        `[SECURITY: ${securityStatus}]`,
        `Your name is ${identity.name}.`,
        '',
        '### SYSTEM PLAN (LEGO LANE)',
        'You operate in a modular LEGO-style architecture. You only receive detailed instructions for modules you request.',
        'To get the content of a Lego brick, use accurately named XML tag: `<GET_LEGO name="lego_name" />`.',
        '',
        '**Available Lego Bricks:**',
        availableLegos,
        '',
        '### LONG-TERM MEMORY (PASSIVE ISOLATION)',
        'You start every session with ZERO knowledge of past interactions. Accessing `storage/sessions` without an EXPLICIT user request is STRICTLY DENIED.',
        'If and only if the user asks about "past sessions" or "previous work," you may use `<LIST path="storage/sessions" />` to identify relevant archives and `<READ />` to load them.',

        ''

    ].join('\n');

    // 3. Mode-based Assembly
    const corePersonaPath = legoRegistry.core_persona;
    const toolboxPath = legoRegistry.toolbox;
    const projectMapPath = legoRegistry.project_map;
    const protocolsPath = legoRegistry.protocols;

    if (mode === 'super-eco') {
        return [
            header,
            '### ECO PROTOCOLS (ULTRA-STRICT)',
            '- Answer in <= 50 tokens if possible. STOP repeating the system prompt details.',
            '- ONE TURN ONLY for general questions. Do NOT use tags unless a file/shell action is EXPLICITLY requested.',
            '- Provide telegraphic, one-line answers. No tables, no long lists, no greetings.',
            '- Use LEGOs/Tools only for EXPLICIT tasks. If the user asks "How are you?", just answer and STOP.',
            '- Memory is summarized; stay focused on the current request.'
        ].join('\n');
    }



    if (mode === 'eco' && corePersonaPath) {
        const corePersona = fs.readFileSync(corePersonaPath, 'utf-8');
        return [
            header,
            corePersona,
            '',
            '### ECO PROTOCOLS',
            '- Be brief and direct.',
            '- Toolbox is NOT loaded by default. Use `<GET_LEGO name="toolbox" />` if you need tool definitions.',
            '- Use LEGOs only as needed.'
        ].join('\n');
    }

    if (mode === 'standard' && corePersonaPath && toolboxPath) {
        const corePersona = fs.readFileSync(corePersonaPath, 'utf-8');
        const toolbox = fs.readFileSync(toolboxPath, 'utf-8');
        return [
            header,
            corePersona,
            toolbox,
            '',
            '### STANDARD PROTOCOLS',
            '- Be concise but helpful.',
            '- **PROACTIVITY**: If a task requires understanding the project structure, dependencies, or file locations, use `<GET_LEGO name="project_map" />` immediately.',
            '- Use `<GET_LEGO name="protocols" />` for advanced coding or self-healing rules.'

        ].join('\n');
    }

    // Full Context
    if (mode === 'full-context' && corePersonaPath && toolboxPath && projectMapPath && protocolsPath) {
        const corePersona = fs.readFileSync(corePersonaPath, 'utf-8');
        const toolbox = fs.readFileSync(toolboxPath, 'utf-8');
        const projectMap = fs.readFileSync(projectMapPath, 'utf-8');
        const protocols = fs.readFileSync(protocolsPath, 'utf-8');
        return [
            header,
            corePersona,
            toolbox,
            projectMap,
            protocols,
            '',
            '### EXPERT PROTOCOLS',
            '- Full autonomy enabled.',
            '- Proactively request any missing LEGOs if they exist.'
        ].join('\n');
    }

    return header; // Fallback
}


