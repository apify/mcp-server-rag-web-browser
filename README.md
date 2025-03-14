# Model Context Protocol (MCP) Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT.

<a href="https://glama.ai/mcp/servers/sr8xzdi3yv"><img width="380" height="200" src="https://glama.ai/mcp/servers/sr8xzdi3yv/badge" alt="mcp-server-rag-web-browser MCP server" /></a>

## 🔄 What is model context protocol?

The Model Context Protocol (MCP) enables AI applications (and AI agents), such as Claude Desktop, to connect to external tools and data sources.
MCP is an open protocol that enables secure, controlled interactions between AI applications, AI Agents, and local or remote resources.

For more information, see the [Model Context Protocol](https://modelcontextprotocol.org/) website or blogpost [What is MCP and why does it matter?](https://blog.apify.com/what-is-model-context-protocol/).

## 🤖 How is MCP Server related to AI Agents?

The Apify MCP Server exposes Apify's Actors through the MCP protocol, allowing AI Agents or frameworks that implement the MCP protocol to access all Apify Actors as tools for data extraction, web searching, and other tasks.

To learn more about AI Agents, explore our blog post: [What are AI Agents?](https://blog.apify.com/what-are-ai-agents/) and browse Apify's curated [AI Agent collection](https://apify.com/store/collections/ai_agents). Wondering if AI Agents are suitable for your specific needs? Our guide [AI agent workflow: building an agent to query Apify datasets](https://blog.apify.com/ai-agent-workflow/) walks you through practical implementation considerations and use cases.

## 🎯 What does this MCP server do?

The RAG Web Browser Actor allows an AI assistant to:
- Perform web search, scrape the top N URLs from the results, and return their cleaned content as Markdown
- Fetch a single URL and return its content as Markdown

## 🧱 Components

### Tools

- **search**: Query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown.
  - Arguments:
    - `query` (string, required): Search term or URL
    - `maxResults` (number, optional): Maximum number of search results to scrape (default: 1)
    - `scrapingTool` (string, optional): Select a scraping tool for extracting web pages. Options: 'browser-playwright' or 'raw-http' (default: 'raw-http')
    - `outputFormats` (array, optional): Select one or more formats for the output. Options: 'text', 'markdown', 'html' (default: ['markdown'])
    - `requestTimeoutSecs` (number, optional): Maximum time in seconds for the request (default: 40)

## 🛠️ Configuration

### Prerequisites

- MacOS or Windows
- The latest version of Claude Desktop must be installed (or another MCP client)
- [Node.js](https://nodejs.org/en) (v18 or higher)
- [Apify API Token](https://docs.apify.com/platform/integrations/api#api-token) (`APIFY_TOKEN`)

### Install

Follow the steps below to set up and run the server on your local machine:
First, clone the repository using the following command:

```bash
git clone git@github.com:apify/mcp-server-rag-web-browser.git
```

Navigate to the project directory and install the required dependencies:

```bash
cd mcp-server-rag-web-browser
npm install
```

Before running the server, you need to build the project:

```bash
npm run build
```

#### Claude Desktop

Configure Claude Desktop to recognize the MCP server.

1. Open your Claude Desktop configuration and edit the following file:

   - On macOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

    ```text
    "mcpServers": {
      "mcp-server-rag-web-browser": {
        "command": "npx",
        "args": [
          "/path/to/mcp-server-rag-web-browser/dist/index.js"
        ],
        "env": {
           "APIFY_TOKEN": "your-apify-api-token"
        }
      }
    }
    ```

2. Restart Claude Desktop

    - Fully quit Claude Desktop (ensure it's not just minimized or closed).
    - Restart Claude Desktop.
    - Look for the 🔌 icon to confirm that the server is connected.

3. Examples

    You can ask Claude to perform web searches, such as:
    ```text
    What is an MCP server and how can it be used?
    What is an LLM, and what are the recent news updates?
    Find and analyze recent research papers about LLMs.
    ```

## 👷🏼 Development

### Local client (stdio)

To test the server locally, you can use `example_client_stdio.ts`:

```bash
export APIFY_TOKEN=your-apify-api-token
node dist/example_client_stdio.js
```

The script will start the MCP server, fetch available tools, and then call the `search` tool with a query.

### Direct API Call

To test calling the RAG Web Browser Actor directly:

```bash
export APIFY_TOKEN=your-apify-api-token
node dist/example_call_web_browser.js
```

### Debugging

Since MCP servers operate over standard input/output (stdio), debugging can be challenging.
For the best debugging experience, use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

Build the mcp-server-rag-web-browser package:

```bash
npm run build
```

You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
export APIFY_TOKEN=your-apify-api-token
npx @modelcontextprotocol/inspector node dist/index.js
```

Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.
