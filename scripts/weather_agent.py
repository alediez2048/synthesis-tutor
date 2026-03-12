"""
Example Claude Agent SDK script with a weather MCP tool.
Run from project root with the venv activated.

Requires ANTHROPIC_API_KEY in .env.local (or env). Optional: LANGSMITH_API_KEY for tracing.
"""
import asyncio
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

# Load .env.local from project root. override=True ensures Cursor's placeholder
# ANTHROPIC_API_KEY (if set) is replaced by our real key from .env.local.
_root = Path(__file__).resolve().parent.parent
_env_file = _root / ".env.local"
load_dotenv(_env_file, override=True)
_key = os.environ.get("ANTHROPIC_API_KEY", "")
if not _key:
    raise SystemExit(
        f"ANTHROPIC_API_KEY not set. Add it to {_env_file} as ANTHROPIC_API_KEY=sk-ant-... "
        "or run: ANTHROPIC_API_KEY=your_key python scripts/weather_agent.py"
    )

from claude_agent_sdk import (
    ClaudeAgentOptions,
    ClaudeSDKClient,
    create_sdk_mcp_server,
    tool,
)
from langsmith.integrations.claude_agent_sdk import configure_claude_agent_sdk

# Only enable LangSmith tracing if you have a valid API key (otherwise you get 403 Forbidden)
if os.environ.get("LANGSMITH_API_KEY") or os.environ.get("LANGCHAIN_API_KEY"):
    configure_claude_agent_sdk()


@tool(
    "get_weather",
    "Gets the current weather for a given city",
    {"city": str},
)
async def get_weather(args: dict[str, Any]) -> dict[str, Any]:
    city = args["city"]
    weather_data = {
        "San Francisco": "Foggy, 62°F",
        "New York": "Sunny, 75°F",
        "London": "Rainy, 55°F",
        "Tokyo": "Clear, 68°F",
    }
    weather = weather_data.get(city, "Weather data not available")
    return {"content": [{"type": "text", "text": f"Weather in {city}: {weather}"}]}


async def main() -> None:
    weather_server = create_sdk_mcp_server(
        name="weather",
        version="1.0.0",
        tools=[get_weather],
    )

    options = ClaudeAgentOptions(
        model="claude-sonnet-4-5-20250929",
        system_prompt="You are a friendly travel assistant who helps with weather information.",
        mcp_servers={"weather": weather_server},
        allowed_tools=["mcp__weather__get_weather"],
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("What's the weather like in San Francisco and Tokyo?")

        async for message in client.receive_response():
            print(message)


if __name__ == "__main__":
    asyncio.run(main())
