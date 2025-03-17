/* eslint-disable no-console */
/**
 * Connect to the MCP server using stdio transport and call a tool.
 * You need provide a path to MCP server and APIFY_TOKEN in .env file.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { APIFY_TOKEN } = process.env;

if (!APIFY_TOKEN) {
    throw new Error('APIFY_TOKEN environment variable is not set.');
}

const SERVER_PATH = '../dist/index.js';

// Create server parameters for stdio connection
const transport = new StdioClientTransport({
    command: 'node', // Executable
    args: [
        SERVER_PATH,
    ],
    env: {
        'APIFY_TOKEN': APIFY_TOKEN
    }
});

// Create a new client instance
const client = new Client(
    { name: 'example-client', version: '1.0.0' },
    { capabilities: {} },
);

// Main function to run the example client
async function run() {
    try {
        // Connect to the MCP server
        await client.connect(transport);

        // List available tools
        const tools = await client.listTools();
        console.log('Available tools:', tools);

        // Call a tool
        console.log('Calling rag web browser ...');
        const result = await client.callTool(
            { name: 'search', arguments: { query: 'web browser for Anthropic' } },
            CallToolResultSchema,
        );
        console.log('Tool result:', JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the main function
await run();
