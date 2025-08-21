# MCP Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT.

> **This MCP server is deprecated in favor of mcp.apify.com**
>
> For the same functionality and much more, please use one of these alternatives:

## 🚀 **Recommended: Use mcp.apify.com**

The easiest way to get the same web browsing capabilities is to use **[mcp.apify.com](https://mcp.apify.com)** with default settings.

**Benefits:**
- ✅ No local setup required
- ✅ Always up-to-date
- ✅ Access to 6,000+ Apify Actors (including RAG Web Browser)
- ✅ OAuth support for easy connection
- ✅ Dynamic tool discovery

**Quick Setup:**
1. Go to [mcp.apify.com](https://mcp.apify.com)
2. Connect your MCP `client (Claude.ai, VS Code, etc.)
3. Start using web browsing and other tools immediately`
4.
## 🌐 **Alternative: Direct RAG Web Browser Integration**

You can also use the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser) directly, which provides an SSE endpoint for real-time integration.

**Benefits:**
- ✅ Direct integration without mcp.apify.com
- ✅ Real-time streaming via Server-Sent Events
- ✅ Full control over the integration
- ✅ No additional dependencies

**Documentation:** [RAG Web Browser Actor Documentation](https://apify.com/apify/rag-web-browser#anthropic-model-context-protocol-mcp-server)

---

## 🎯 What does this MCP server do?

This server is specifically designed to provide fast responses to AI agents and LLMs, allowing them to interact with the web and extract information from web pages.
It runs locally and communicates with the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser) in [**Standby mode**](https://docs.apify.com/platform/actors/running/standby),
sending search queries and receiving extracted web content in response.

- **Web Search**: Query Google Search, scrape top N URLs, return cleaned content as Markdown
- **Single URL Fetching**: Fetch a specific URL and return its content as Markdown
- **Local MCP Integration**: Standard input/output (stdio) communication with AI clients

## 🧱 Components

### Tools

- **search**: Query Google Search, scrape the top N URLs from the results, and returns their cleaned content as Markdown. Arguments:
  - `query` (string, required): Search term or URL
  - `maxResults` (number, optional): Maximum number of search results to scrape (default: 1)
  - `scrapingTool` (string, optional): Select a scraping tool for extracting web pages. Options: 'browser-playwright' or 'raw-http' (default: 'raw-http')
  - `outputFormats` (array, optional): Select one or more formats for the output. Options: 'text', 'markdown', 'html' (default: ['markdown'])
  - `requestTimeoutSecs` (number, optional): Maximum time in seconds for the request (default: 40)


## 🔄 Migration Guide

### From Local MCP Server to mcp.apify.com

**Before (Deprecated):**
```json
{
  "mcpServers": {
    "rag-web-browser": {
      "command": "npx",
      "args": ["@apify/mcp-server-rag-web-browser"],
      "env": {
        "APIFY_TOKEN": "your-apify-api-token"
      }
    }
  }
}
```

**After (Recommended):**
```json
{
  "mcpServers": {
    "apify": {
      "command": "npx",
      "args": ["@apify/actors-mcp-server"],
      "env": {
        "APIFY_TOKEN": "your-apify-api-token"
      }
    }
  }
}
```

Or simply use the hosted endpoint: `https://mcp.apify.com`

### MCP clients
- [Claude Desktop](https://claude.ai/download)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Apify Tester MCP Client](https://apify.com/jiri.spilka/tester-mcp-client)

## 🛠️ Development (For reference only)

### Prerequisites
- Node.js (v18 or higher)
- [Apify API Token](https://docs.apify.com/platform/integrations/api#api-token) (`APIFY_TOKEN`)

First, clone the repository using the following command:
```bash
git clone git@github.com:apify/mcp-server-rag-web-browser.git
```

Navigate to the project directory and install the required dependencies:

```bash
cd mcp-server-rag-web-browser
npm install
```

### Build
```bash
npm install
npm run build
```

### Debugging

Since MCP servers operate over standard input/output (stdio), debugging can be challenging.
For the best debugging experience, use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector).

You can launch the MCP Inspector via [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) with this command:

```bash
export APIFY_TOKEN=your-apify-api-token
npx @modelcontextprotocol/inspector node dist/index.js
```
Upon launching, the Inspector will display a URL that you can access in your browser to begin debugging.

# 📖 Learn more

- [Model Context Protocol](https://modelcontextprotocol.org/)
- [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser)
- [What are AI Agents?](https://blog.apify.com/what-are-ai-agents/)
- [What is MCP and why does it matter?](https://blog.apify.com/what-is-model-context-protocol/)
- [How to use MCP with Apify Actors](https://blog.apify.com/how-to-use-mcp/)
- [Tester MCP Client](https://apify.com/jiri.spilka/tester-mcp-client)
- [Webinar: Building and Monetizing MCP Servers on Apify](https://www.youtube.com/watch?v=w3AH3jIrXXo)
- [MCP Client development guide](https://github.com/cyanheads/model-context-protocol-resources/blob/main/guides/mcp-client-development-guide.md)
- [How to build and monetize an AI agent on Apify](https://blog.apify.com/how-to-build-an-ai-agent/)

*This repository is maintained for archival purposes only. Please use the recommended alternatives above for active development.*
