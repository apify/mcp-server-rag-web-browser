# Model Context Protocol (MCP) Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT.

<a href="https://glama.ai/mcp/servers/sr8xzdi3yv"><img width="380" height="200" src="https://glama.ai/mcp/servers/sr8xzdi3yv/badge" alt="mcp-server-rag-web-browser MCP server" /></a>

## 🎯 What does this MCP server do?

This server is specifically designed to provide fast responses to AI agents and LLMs, allowing them to interact with the web and extract information from web pages.
It runs locally and communicates with the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser) in [**Standby mode**](https://docs.apify.com/platform/actors/running/standby),
sending search queries and receiving extracted web content in response.

The RAG Web Browser Actor allows an AI assistant to:
- Perform web search, scrape the top N URLs from the results, and return their cleaned content as Markdown
- Fetch a single URL and return its content as Markdown

## 🧱 Components

### Tools

- **search**: Query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown. Arguments:
  - `query` (string, required): Search term or URL
  - `maxResults` (number, optional): Maximum number of search results to scrape (default: 1)
  - `scrapingTool` (string, optional): Select a scraping tool for extracting web pages. Options: 'browser-playwright' or 'raw-http' (default: 'raw-http')
  - `outputFormats` (array, optional): Select one or more formats for the output. Options: 'text', 'markdown', 'html' (default: ['markdown'])
  - `requestTimeoutSecs` (number, optional): Maximum time in seconds for the request (default: 40)

## 🔄 What is the Model Context Protocol?

The Model Context Protocol (MCP) is a framework that enables AI applications, such as Claude Desktop, to connect seamlessly with external tools and data sources.
For more details, visit the [Model Context Protocol website](https://modelcontextprotocol.org/) or read the blog post [What is MCP and why does it matter?](https://blog.apify.com/what-is-model-context-protocol/).

## 🤖 How does the MCP Server integrate with AI Agents?

The MCP Server empowers AI Agents to perform web searches and browsing using the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
For a comprehensive understanding of AI Agents, check out our blog post: [What are AI Agents?](https://blog.apify.com/what-are-ai-agents/) and explore Apify's [Agents](https://apify.com/store/categories/agents).

Interested in building and monetizing your own AI agent on Apify? Check out our [step-by-step guide](https://blog.apify.com/how-to-build-an-ai-agent/) for creating, publishing, and monetizing AI agents on the Apify platform.

## 🔌 Related MCP servers and clients by Apify

This server operates over standard input/output (stdio), providing a straightforward connection to AI Agents. Apify offers several other MCP-related tools:

### Server Options
- **🖥️ This MCP Server** – A local stdio-based server for direct integration with Claude Desktop
- **🌐 [RAG Web Browser Actor via SSE](https://apify.com/apify/rag-web-browser#anthropic-model-context-protocol-mcp-server)** – Access the RAG Web Browser directly via Server-Sent Events without running a local server
- **🇦 [MCP Server Actor](https://apify.com/apify/actors-mcp-server)** – MCP Server that provides AI agents with access to over 4,000 specialized [Apify Actors](https://apify.com/store)

### Client Options
- **💬 [Tester MCP Client](https://apify.com/jiri.spilka/tester-mcp-client)** – A user-friendly UI for interacting with any SSE-based MCP server

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
      "rag-web-browser": {
        "command": "npx",
        "args": [
          "@apify/mcp-server-rag-web-browser"
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

Debug the server using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
```bash
export APIFY_TOKEN=your-apify-api-token
npx @modelcontextprotocol/inspector npx -y @apify/mcp-server-rag-web-browser
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
