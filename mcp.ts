// Standalone MCP server entry point (stdio transport).
// Use this for Claude Desktop or other subprocess-based MCP clients.
// The MCP server also launches by default with the Express service at /mcp.
//
// Requires MCP_ACCESS_TOKEN environment variable for authentication.

import 'source-map-support/register';
import 'module-alias/register';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Redirect console.log/info to stderr so they don't corrupt MCP stdio on stdout.
const _stderr = console.error.bind(console);
console.log = (...args: any[]) => _stderr('[MCP]', ...args);
console.info = (...args: any[]) => _stderr('[MCP]', ...args);

import loadSequelize from './loadSequelize';
import loadAcl from '@Services/AccessControlService/initialize';
import { getOrCreateBotClient } from '@Services/AgentService';
import { createMcpServer } from './api/mcp';
import { StdioServerTransport } from './api/mcp/sdk';
import { AuthorizationAccessToken } from '@Models';

async function main() {
  await loadSequelize();
  await loadAcl();
  const botClient = await getOrCreateBotClient();

  // Authenticate via MCP_ACCESS_TOKEN env var
  const tokenStr = process.env.MCP_ACCESS_TOKEN;
  if (!tokenStr) {
    console.error('MCP_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  const accessToken = await AuthorizationAccessToken.findOne({
    where: { token: tokenStr, status: 'active' },
  });
  if (!accessToken) {
    console.error('Invalid or revoked MCP_ACCESS_TOKEN');
    process.exit(1);
  }
  if (new Date(accessToken.expire) < new Date()) {
    console.error('MCP_ACCESS_TOKEN has expired');
    process.exit(1);
  }

  const clientId = accessToken.owner;
  console.log(`Authenticated as client ${clientId}`);

  const server = createMcpServer(botClient.id, clientId);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});
