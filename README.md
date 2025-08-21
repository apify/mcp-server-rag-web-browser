# MCP Server for the RAG Web Browser Actor 🌐

Implementation of an MCP server for the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser).
This Actor serves as a web browser for large language models (LLMs) and RAG pipelines, similar to a web search in ChatGPT.

> **This MCP server is deprecated in favor of [mcp.apify.com](https://mcp.apify.com)**
>
> For the same functionality and much more, please use one of these alternatives:

## 🚀 Recommended: use mcp.apify.com

The easiest way to get the same web browsing capabilities is to use **[mcp.apify.com](https://mcp.apify.com)** with default settings.

**Benefits:**
- ✅ No local setup required
- ✅ Always up-to-date
- ✅ Access to 6,000+ Apify Actors (including RAG Web Browser)
- ✅ OAuth support for easy connection
- ✅ Dynamic tool discovery

**Quick Setup:**
1. Go to https://mcp.apify.com
2. Authorize the client (Claude, VS Code, etc.)
3. Copy the generated MCP server configuration (or use OAuth flow if supported)
4. Start using browsing & other tools immediately

## 🌐 Alternative: direct RAG Web Browser integration

You can also call the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser) directly via its HTTP/SSE interface.

**Benefits:**
- ✅ Direct integration without mcp.apify.com
- ✅ Real-time streaming via Server-Sent Events
- ✅ Full control over the integration
- ✅ No additional dependencies

**Docs:** [Actor Documentation](https://apify.com/apify/rag-web-browser#anthropic-model-context-protocol-mcp-server)

---

## 🎯 What does this MCP server do?

This server is specifically designed to provide fast responses to AI agents and LLMs, allowing them to interact with the web and extract information from web pages.
It runs locally and communicates with the [RAG Web Browser Actor](https://apify.com/apify/rag-web-browser) in [**Standby mode**](https://docs.apify.com/platform/actors/running/standby),
sending search queries and receiving extracted web content in response.

- **Web Search**: Query Google Search, scrape top N URLs, and return cleaned content as Markdown
- **Single URL Fetching**: Fetch a specific URL and return its content as Markdown
- **Local MCP Integration**: Standard input/output (stdio) communication with AI clients

## 🧱 Components

### Tools

- name: `search`
  description: Query Google Search OR fetch a direct URL and return cleaned page contents.
  arguments:
  - `query` (string, required): Search keywords or a full URL. Advanced Google operators supported.
  - `maxResults` (number, optional, default: 1): Max organic results to fetch (ignored when `query` is a URL).
  - `scrapingTool` (string, optional, default: `raw-http`): One of `browser-playwright` | `raw-http`.
    - `raw-http`: Fast (no JS execution) – good for static pages.
    - `browser-playwright`: Handles JS-heavy sites – slower, more robust.
  - `outputFormats` (array of strings, optional, default: [`markdown`]): One or more of `text`, `markdown`, `html`.
  - `requestTimeoutSecs` (number, optional, default: 40, min 1 max 300): Total server-side AND client wait budget. A local abort is enforced.


## 🔄 Migration Guide

### From Local MCP Server to mcp.apify.com

**Before (Deprecated local server):**
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

**After (Recommended Apify server):**
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
Or use the hosted endpoint: `https://mcp.apify.com` (when your client supports HTTP transport / remote MCP).

### MCP clients
- Claude Desktop: https://claude.ai/download
- Visual Studio Code
- Apify Tester MCP Client: https://apify.com/jiri.spilka/tester-mcp-client

## 🛠️ Development

### Prerequisites
- Node.js (v18 or higher)
- Apify API Token (`APIFY_TOKEN`)

Clone & install:
```bash
git clone https://github.com/apify/mcp-server-rag-web-browser.git
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
- [How to build and monetize an AI agent on Apify](https://blog.apify.com/how-to-build-an-ai-agent/)
- [Build and deploy MCP servers in minutes with a TypeScript template](https://blog.apify.com/build-and-deploy-mcp-servers-typescript/)

*This repository is maintained for archival purposes only. Please use the recommended alternatives above for active development.*
