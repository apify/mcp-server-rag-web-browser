/* eslint-disable no-console */
/**
 * Connect to the MCP server using SSE transport and call a tool.
 * You need provide a path to URL to the server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { EventSource } from 'eventsource';

const SERVER_URL = 'http://localhost:3001/sse';

// @ts-expect-error: EventSource may not be defined on globalThis
if (typeof globalThis.EventSource === 'undefined') {
    // @ts-expect-error: Assigning a property that TypeScript doesn't currently recognize on globalThis
    globalThis.EventSource = EventSource;
}

async function main(): Promise<void> {
    const transport = new SSEClientTransport(new URL(SERVER_URL)
    );
    const client = new Client(
        { name: 'example-client', version: '1.0.0' },
        { capabilities: {} },
    );

    try {
        // Connect to the MCP server
        await client.connect(transport);

        // List available tools
        const tools = await client.listTools();
        console.log('Available tools:', tools);

        // Call a tool
        console.log('Calling "search" tool ...');
        const results = await client.callTool(
            { name: 'search', arguments: { query: 'web browser for Anthropic' } },
            CallToolResultSchema,
        );
        console.log('Tool result:', JSON.stringify(results, null, 2));

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
            console.error(error.stack);
        } else {
            console.error('An unknown error occurred:', error);
        }
    }
}

await main();
