import asyncio
import os

from dotenv import load_dotenv
from mcp.client.session import ClientSession
from mcp.client.sse import sse_client

load_dotenv(dotenv_path="../.env")

headers = {"Authorization": f"Bearer {os.getenv('APIFY_API_TOKEN')}"}

async def run():

    async with sse_client(url="https://jiri-spilka--rag-web-browser-task.apify.actor/sse", timeout=60, headers=headers) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()
            print("Available Tools:", tools, end="\n\n")

            result = await session.call_tool("rag-web-browser", { "query": "example.com", "maxResults": 3 })
            print("Tools Call Result:")

            for content in result.content:
                print(content)

asyncio.run(run())
