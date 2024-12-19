/* eslint-disable no-console */
/**
 * You need provide a path to MCP server and APIFY_API_TOKEN in .env file.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

import { EventSource } from 'eventsource';

// Assign the polyfill to the global scope if necessary
//@ts-ignore
if (typeof global !== 'undefined' && !global.EventSource) {
    //@ts-ignore
    global.EventSource = EventSource;
}


dotenv.config({ path: '../.env' });

const transport = new SSEClientTransport(new URL('http://localhost:3001/sse'));
const client = new Client(
    { name: 'example-client', version: '1.0.0' },
    { capabilities: {} }
);

// Main function to run the example client
async function run() {
    try {
        // Connect to the MCP server
        await client.connect(transport);

        // List available tools
        const tools = await client.listTools()
        console.log('Available tools:', tools);

        // Call a tool
        console.log('Calling rag web browser ...');
        const results = await client.callTool(
            {name: 'search', arguments: { query: 'web browser for Anthropic' }},
            CallToolResultSchema
        );

        console.log('Tool result:', JSON.stringify(results));
    } catch (error) {
        console.error('Error:', error);
    }
}

// Execute the main function
await run();
