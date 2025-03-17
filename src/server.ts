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
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';


const { APIFY_TOKEN } = process.env;

const MAX_RESULTS = 1;
const TOOL_SEARCH = 'search';
const ACTOR_BASE_URL = 'https://rag-web-browser.apify.actor/search';

const WebBrowserArgsSchema = z.object({
    query: z.string()
        .describe('Enter Google Search keywords or a URL of a specific web page. The keywords might include the'
            + 'advanced search operators. Examples: "san francisco weather", "https://www.cnn.com", '
            + '"function calling site:openai.com"')
        .regex(/[^\s]+/, { message: "Search term or URL cannot be empty" }),
    maxResults: z.number().int().positive().min(1).max(100).default(MAX_RESULTS)
        .describe(
            'The maximum number of top organic Google Search results whose web pages will be extracted. '
            + 'If query is a URL, then this field is ignored and the Actor only fetches the specific web page.',
        ),
    scrapingTool: z.enum(['browser-playwright', 'raw-http'])
        .describe('Select a scraping tool for extracting the target web pages. '
        + 'The Browser tool is more powerful and can handle JavaScript heavy websites, while the '
        + 'Plain HTML tool can not handle JavaScript but is about two times faster.')
        .default('raw-http'),
    outputFormats: z.array(z.enum(['text', 'markdown', 'html']))
        .describe('Select one or more formats to which the target web pages will be extracted.')
        .default(['markdown']),
    requestTimeoutSecs: z.number().int().min(1).max(300).default(40)
        .describe('The maximum time in seconds available for the request, including querying Google Search '
            + 'and scraping the target web pages.'),
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
                    tools: {},
                },
            },
        );
        this.setupErrorHandling();
        this.setupToolHandlers();
    }

    private async callRagWebBrowser(args: z.infer<typeof WebBrowserArgsSchema>): Promise<string> {
        if (!APIFY_TOKEN) {
            throw new Error('APIFY_TOKEN is required but not set. '
                + 'Please set it in your environment variables or pass it as a command-line argument.');
        }

        const queryParams = new URLSearchParams({
            query: args.query,
            maxResults: args.maxResults.toString(),
            scrapingTool: args.scrapingTool,
        });

        // Add all other parameters if provided
        if (args.outputFormats) {
            args.outputFormats.forEach((format) => {
                queryParams.append('outputFormats', format);
            });
        }

        const url = `${ACTOR_BASE_URL}?${queryParams.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${APIFY_TOKEN}`,
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
                            + 'Prefer HTTP raw client for speed and browser-playwright for reliability.',
                        inputSchema: zodToJsonSchema(WebBrowserArgsSchema),
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case TOOL_SEARCH: {
                    try {
                        const parsed = WebBrowserArgsSchema.parse(args);
                        const content = await this.callRagWebBrowser(parsed);
                        return {
                            content: [{ type: 'text', text: content }],
                        };
                    } catch (error) {
                        console.error('[MCP Error]', error);
                        throw new Error(`Failed to call RAG Web Browser: ${error}`);
                    }
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
