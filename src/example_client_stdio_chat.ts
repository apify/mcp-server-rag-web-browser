/* eslint-disable no-console */
/**
 * Create a simple chat client that connects to the Model Context Protocol server using the stdio transport.
 * Based on the user input, the client sends a query to the MCP server, retrieves results and processes them.
 *
 * You can expect the following output:
 *
 * MCP Client Started!
 * Type your queries or 'quit|q|exit' to exit.
 * You: Search information about AI agents and provide brief summary
 * [INTERNAL] Received response from Claude: [{"type":"text","text":"I'll search for information about AI agents
 *   and provide you with a summary."},{"type":"tool_use","id":"toolu_01He9TkzQfh2979bbeuxWVqM","name":"search",
 *   "input":{"query":"what are AI agents definition capabilities applications","maxResults":2}}]
 * [INTERNAL] Calling tool: {"name":"search","arguments":{"query":"what are AI agents definition ...
 * I can help analyze the provided content about AI agents.
 * This appears to be crawled content from AWS and IBM websites explaining what AI agents are.
 * Let me summarize the key points:
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { Message, TextBlock, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '../.env' });

const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';
const DEBUG = true;
const DEBUG_SERVER_PATH = '../mcp-server-rag-web-browser/build/index.js';

dotenv.config(); // Load environment variables from .env

export type Tool = {
    name: string;
    description: string | undefined;
    input_schema: unknown;
}

class MCPClient {
    private anthropic: Anthropic;
    private client = new Client(
        {
            name: 'example-client',
            version: '1.0.0',
        },
        {
            capabilities: {}, // Optional capabilities
        },
    );

    private tools: Tool[] = [];

    constructor() {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    /**
     * Start the server using node and provided server script path.
     * Connect to the server using stdio transport and list available tools.
     */
    async connectToServer(serverScriptPath: string) {
        const transport = new StdioClientTransport({
            command: 'node', // Executable
            args: [
                serverScriptPath,
                `APIFY_API_TOKEN=${process.env.APIFY_API_TOKEN}`,
            ],
        });

        await this.client.connect(transport);
        const response = await this.client.listTools();

        this.tools = response.tools.map((x) => ({
            name: x.name,
            description: x.description,
            input_schema: x.inputSchema,
        }));
        console.log('Connected to server with tools:', this.tools.map((x) => x.name));
    }

    /**
     * Process LLM response and check whether it contains any tool calls.
     * If a tool call is found, call the tool and return the response and save the results to messages with type: user.
     * If the tools response is too large, truncate it to the limit.
     */
    async processMsg(response: Message): Promise<string> {
        const finalText: string[] = [];

        for (const content of response.content) {
            if (content.type === 'text') {
                finalText.push(content.text);
            } else if (content.type === 'tool_use') {
                finalText.push(await this.handleToolCall(content));
            }
        }
        return finalText.join('\n');
    }

    /**
     * Call the tool and return the response.
     */
    private async handleToolCall(content: ToolUseBlock) {
        const finalText: string[] = [];
        const messages: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params = { name: content.name, arguments: content.input as any };
        console.log(`[INTERNAL] Calling tool: ${JSON.stringify(params)}`);
        let results;

        try {
            finalText.push(`[Calling tool: ${params.name} with arguments ${JSON.stringify(params.arguments)}]`);
            results = await this.client.callTool(params, CallToolResultSchema);
        } catch (error) {
            finalText.push(`Error calling tool: ${error}`);
            return finalText.join('\n');
        }

        if ('text' in content && content.text) {
            messages.push({ role: 'assistant', content: content.text });
        }

        messages.push({ role: 'user', content: JSON.stringify(results.content) });
        // Get next response from Claude
        const nextResponse: Message = await this.anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1000,
            messages,
            tools: this.tools as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        const textBlock = nextResponse.content[0] as TextBlock;
        finalText.push(textBlock.text);
        return finalText.join('\n');
    }

    /**
     * Process the user query by sending it to the server and returning the response.
     * Also, process any tool calls.
     */
    async processQuery(query: string): Promise<string> {
        const msg: Message = await this.anthropic.messages.create({
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            messages: [{ role: 'user', content: query }],
            tools: this.tools as any[], // eslint-disable-line @typescript-eslint/no-explicit-any
        });
        console.log('[INTERNAL] Received response from Claude:', JSON.stringify(msg.content));

        return await this.processMsg(msg);
    }

    /**
     * Create a chat loop that reads user input from the console and sends it to the server for processing.
     */
    async chatLoop() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'You: ',
        });

        console.log("MCP Client Started!\nType your queries or 'quit|q|exit' to exit.");
        rl.prompt();

        rl.on('line', async (input) => {
            const v = input.trim().toLowerCase();
            if (v === 'quit' || v === 'q' || v === 'exit') {
                rl.close();
                return;
            }
            try {
                const response = await this.processQuery(input);
                console.log('Claude:', response);
            } catch (error) {
                console.error('Error processing query:', error);
            }
            rl.prompt();
        });
    }
}

async function main() {
    const client = new MCPClient();

    if (process.argv.length < 3) {
        if (DEBUG) {
            process.argv.push(DEBUG_SERVER_PATH);
        } else {
            console.error('Usage: node <path_to_server_script>');
            process.exit(1);
        }
    }

    try {
        await client.connectToServer(process.argv[2]);
        await client.chatLoop();
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
