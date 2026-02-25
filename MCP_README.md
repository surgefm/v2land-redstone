# Surge Newsroom MCP Server

An MCP (Model Context Protocol) server that exposes Surge (浪潮) newsroom timeline editing tools, allowing LLM clients like Claude Desktop to directly manage event timelines.

## Prerequisites

- Node.js 18+
- PostgreSQL database with v2land schema
- Redis server
- Environment variables configured (see `.env.example`)

## Setup

Install dependencies (if not already done):

```bash
yarn install
```

Build:

```bash
yarn build
```

## Running

### Default: With Express (Streamable HTTP)

The MCP server launches automatically with the regular Express service at `/mcp`:

```bash
yarn start   # or: node dist/app.js
```

The MCP endpoint is available at `http://localhost:1337/mcp` using the Streamable HTTP transport. Each session gets independent state.

### Standalone: stdio transport

For Claude Desktop or other subprocess-based MCP clients, a standalone stdio entry point is also available at `dist/mcp.js`:

```bash
yarn mcp   # or: node dist/mcp.js
```

## Claude Desktop Configuration

For the **stdio** transport, add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "surge-newsroom": {
      "command": "node",
      "args": ["/absolute/path/to/v2land-redstone/dist/mcp.js"],
      "env": {
        "POSTGRES_HOST": "127.0.0.1",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PWD": "postgres",
        "POSTGRES_DB": "v2land",
        "REDIS_HOST": "127.0.0.1",
        "REDIS_SSL": "false",
        "SEQUELIZE_LOGGING": "false"
      }
    }
  }
}
```

For the **Streamable HTTP** transport (when the Express server is already running):

```json
{
  "mcpServers": {
    "surge-newsroom": {
      "type": "streamable-http",
      "url": "http://localhost:1337/mcp"
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `set_event` | Set the active event/timeline ID for the session |
| `get_current_stacks` | Get current timeline state (stacks, news, off-shelf news) |
| `create_stack` | Create a new progress entry in the timeline |
| `add_news_to_event` | Add a news article to the event, optionally to a stack |
| `add_news_to_stack` | Move an existing news item into a specific stack |
| `update_stack` | Update a stack's title, description, or time |
| `reorder_stacks` | Rearrange the display order of stacks |
| `send_chat_message` | Send a message to the newsroom chatroom |
| `ask_user_question` | Ask a clarification question in the newsroom chat |

## Usage Pattern

1. Call `set_event` with the event ID to set session context
2. Call `get_current_stacks` to understand the current timeline
3. Use other tools to modify the timeline

## Testing

Use the MCP Inspector for interactive testing.

Against the running Express server:

```bash
npx @modelcontextprotocol/inspector --transport streamable-http http://localhost:1337/mcp
```

Against the standalone stdio server:

```bash
npx @modelcontextprotocol/inspector node dist/mcp.js
```

---

## Surge Editorial Guidelines

### What is a Social Event (事件)

A social event on Surge is any occurrence that affects the interests of one or more groups. It must have accompanying news that meets the platform's source standards.

Social events are **not**:
- Fictional matters
- Broad categories (e.g., "internet rights", "education system", "healthcare")
- Personal diaries or private matters

### Progress Entries (进展)

Each progress entry represents a distinct, real-world development in the event — not commentary or opinion.

- Every progress entry must have a **timestamp** and a **concise summary**
- Descriptions must be **supported by news sources** (each progress entry requires at least one news article)
- Progress descriptions should be **3-5 sentences**, self-contained, including key facts, data, and context so readers can understand the development without reading the original articles
- **Editorials and opinion pieces should not constitute a progress entry** — unless the opinion itself significantly influenced the event's trajectory
- All datetimes must use **full ISO 8601 format with timezone** (e.g., `2025-01-15T14:30:00Z`)
- Progress entry time should be **when the real event happened**, not when the article was published. Extract the actual event date from the article content. If unknown, use the earliest article date among the progress entry's news items

### News Sources (新闻来源)

#### Source Credibility Tiers

**Preferred sources:**
- Wire services: Reuters, AP, AFP, Xinhua (新华社), China News Service (中新社)
- Major newspapers: New York Times, Washington Post, The Guardian, BBC, Southern Weekend (南方周末), Caixin (财新)
- Official institutions: government statements, court documents, public company filings
- Recognized mainland news sites: The Paper (澎湃新闻), Caixin (财新)
- Recognized international media: New York Times (纽约时报), Initium Media (端传媒)

**Acceptable sources:**
- Well-known industry media
- Fact-checked professional media
- Provincial-level or above mainland Chinese media (e.g., Beijing News / 新京报, People's Daily / 人民日报)

**Avoid:**
- Social media posts, personal blogs
- Commentary/editorial articles (as news sources)
- Content aggregation websites
- Unverified self-media

**Special cases:**
- For parties directly involved in an event, their social media or press releases are acceptable
- Widely-circulated misinformation (2,000+ Weibo reposts, 10,000+ Zhihu upvotes) may be included only if clearly labeled as unreliable

#### News Formatting Requirements

- Each news item must include: **URL**, **source** (media outlet name), **title**, **publication time**
- Always prefer the **original/primary reporting source** over reprints or aggregators
- When the same article exists in multiple Chinese variants, prefer **Simplified Chinese**
- For Weibo posts: author should be listed as `@username`; summaries must not use original text without permission
- **Titles and summaries must not distort the content** of the original article
- News is not commentary or summary articles (新闻不是评论或汇总文章)

### Content Quality Principles

- Pursue **comprehensiveness** and **neutrality**
- Content must be based on **credible news sources**
- The platform labels source credibility levels
- When multiple sources report the same event, prefer the **original reporting source** over reprints
