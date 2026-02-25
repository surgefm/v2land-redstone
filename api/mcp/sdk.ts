// Re-export MCP SDK classes using require() because:
// 1. TypeScript 4.6 doesn't resolve package.json "exports" maps
// 2. Zod 3.25's v4 compat .d.cts files are incompatible with TS 4.6
// At runtime, Node.js resolves these correctly through the exports map.

/* eslint-disable @typescript-eslint/no-var-requires */
export const McpServer: any = require('@modelcontextprotocol/sdk/server/mcp.js').McpServer;
export const StdioServerTransport: any =
  require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
export const StreamableHTTPServerTransport: any =
  require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport;
