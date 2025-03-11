#!/usr/bin/env node

/**
 * MCP server that allows to call the RAG Web Browser Actor
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

const argToken = process.argv.find((arg) => arg.startsWith('APIFY_API_TOKEN='))?.split('=')[1];
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || argToken;

const MAX_RESULTS = 1;
const TOOL_SEARCH = 'search';
const ACTOR_BASE_URL = 'https://rag-web-browser.apify.actor/search';

const WebBrowserArgsSchema = z.object({
    query: z.string().describe('Google Search keywords or a URL of a specific web page'),
    maxResults: z.number().int().positive().default(MAX_RESULTS)
        .describe(
            'The maximum number of top organic Google Search results whose web pages will be extracted',
        ),
    scrapingTool: z.enum(['browser-playwright', 'raw-http'])
        .describe('Select a scraping tool for extracting the target web pages. '
        + 'The Browser tool is more powerful and can handle JavaScript heavy websites, while the '
        + 'Plain HTML tool can not handle JavaScript but is about two times faster.')
        .default('raw-http'),
});

/**
 * Create an MCP server with a tool to call RAG Web Browser Actor
 */
export class RagWebBrowserServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'mcp-server-rag-web-browser',
                version: '0.1.0',
            },
            {
                capabilities: {
                    prompts: {},
                    tools: {},
                },
            },
        );
        this.setupErrorHandling();
        this.setupToolHandlers();
    }

    private async callRagWebBrowser(query: string, maxResults: number, scrapingTool: string): Promise<string> {
        if (!APIFY_API_TOKEN) {
            throw new Error('APIFY_API_TOKEN is required but not set. '
                + 'Please set it in your environment variables or pass it as a command-line argument.');
        }

        const queryParams = new URLSearchParams({
            query,
            maxResults: maxResults.toString(),
            scrapingTool,
        });
        const url = `${ACTOR_BASE_URL}?${queryParams.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${APIFY_API_TOKEN}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to call RAG Web Browser: ${response.statusText}`);
        }

        const responseBody = await response.json();
        return JSON.stringify(responseBody);
    }

    private setupErrorHandling(): void {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error); // eslint-disable-line no-console
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupToolHandlers(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: TOOL_SEARCH,
                        description: 'Search phrase or a URL at Google and return crawled web pages as text or Markdown. '
                            + 'Prefer HTTP client for speed and browser-playwright for reability.',
                        inputSchema: zodToJsonSchema(WebBrowserArgsSchema),
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case TOOL_SEARCH: {
                    const parsed = WebBrowserArgsSchema.parse(args);
                    const content = await this.callRagWebBrowser(parsed.query, parsed.maxResults, parsed.scrapingTool);
                    return {
                        content: [{ type: 'text', text: content }],
                    };
                }
                default: {
                    throw new Error(`Unknown tool: ${name}`);
                }
            }
        });
    }

    async connect(transport: Transport): Promise<void> {
        await this.server.connect(transport);
    }
}
