"use strict";
// Re-export MCP SDK classes using require() because:
// 1. TypeScript 4.6 doesn't resolve package.json "exports" maps
// 2. Zod 3.25's v4 compat .d.cts files are incompatible with TS 4.6
// At runtime, Node.js resolves these correctly through the exports map.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamableHTTPServerTransport = exports.StdioServerTransport = exports.McpServer = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
exports.McpServer = require('@modelcontextprotocol/sdk/server/mcp.js').McpServer;
exports.StdioServerTransport = require('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
exports.StreamableHTTPServerTransport = require('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport;

//# sourceMappingURL=sdk.js.map
