import type { Express, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { SYSTEM_PROMPT } from './mcpInstruction';
import { executeTool, ToolContext } from '@Services/AgentService/tools';
import { McpServer, StreamableHTTPServerTransport } from './sdk';
import * as schemas from './toolSchemas';

interface ToolArgs {
  eventId?: number;
  [key: string]: any;
}

export function createMcpServer(botClientId: number, clientId: number) {
  let sessionEventId: number | null = null;
  const runId = randomUUID();

  function resolveEventId(argsEventId?: number): number {
    const eventId = argsEventId ?? sessionEventId;
    if (!eventId) {
      throw new Error(
        'No eventId provided and no session default set. Call set_event first or pass eventId.',
      );
    }
    return eventId;
  }

  function makeCtx(eventId: number): ToolContext {
    return { eventId, clientId, botClientId, runId, source: 'mcp' };
  }

  function textResult(text: string) {
    return { content: [{ type: 'text' as const, text }] };
  }

  const server = new McpServer(
    { name: 'surge-newsroom', version: '1.0.0' },
    { instructions: SYSTEM_PROMPT },
  );

  server.registerTool(
    'set_event',
    {
      description: 'Set the active event/timeline ID for this session. Once set, other tools will use it by default.',
      inputSchema: schemas.setEventSchema,
    },
    async (args: ToolArgs) => {
      sessionEventId = args.eventId!;
      return textResult(JSON.stringify({ success: true, eventId: args.eventId }));
    },
  );

  server.registerTool(
    'get_current_stacks',
    {
      description: 'Get the current state of the timeline, including all stacks (progress entries), their news items, and off-shelf news. Call this to understand what already exists before making changes.',
      inputSchema: schemas.getCurrentStacksSchema,
    },
    async (args: ToolArgs) => {
      const eventId = resolveEventId(args.eventId);
      const result = await executeTool('get_current_stacks', {}, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'create_stack',
    {
      description: 'Create a new progress entry (stack) in the timeline. Each stack represents a distinct development in the event.',
      inputSchema: schemas.createStackSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('create_stack', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'add_news_to_event',
    {
      description: 'Add a news article to the event. Optionally assign it to a specific stack. The news will appear in the newsroom.',
      inputSchema: schemas.addNewsToEventSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('add_news_to_event', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'add_news_to_stack',
    {
      description: 'Move an existing news item into a specific stack.',
      inputSchema: schemas.addNewsToStackSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('add_news_to_stack', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'update_stack',
    {
      description: "Update an existing stack's title, description, or time.",
      inputSchema: schemas.updateStackSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('update_stack', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'reorder_stacks',
    {
      description: 'Rearrange the display order of stacks in the timeline. Provide stack IDs in the desired order, from most recent (first) to oldest (last).',
      inputSchema: schemas.reorderStacksSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('reorder_stacks', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'send_chat_message',
    {
      description: 'Send a message to the newsroom chatroom. Use this to report progress, share findings, or communicate with editors.',
      inputSchema: schemas.sendChatMessageSchema,
    },
    async (args: ToolArgs) => {
      const { eventId: argsEventId, ...toolArgs } = args;
      const eventId = resolveEventId(argsEventId);
      const result = await executeTool('send_chat_message', toolArgs, makeCtx(eventId));
      return textResult(result);
    },
  );

  server.registerTool(
    'create_event',
    {
      description: 'Create a new event/timeline. Returns the new event ID. Use set_event afterwards to start working on it.',
      inputSchema: schemas.createEventSchema,
    },
    async (args: ToolArgs) => {
      const result = await executeTool('create_event', args, makeCtx(0));
      const parsed = JSON.parse(result);
      if (parsed.eventId) {
        sessionEventId = parsed.eventId;
      }
      return textResult(result);
    },
  );

  server.registerTool(
    'get_newsroom_link',
    {
      description: 'Get the newsroom URL for the current event so the user can review the timeline in their browser.',
      inputSchema: schemas.getNewsroomLinkSchema,
    },
    async (args: ToolArgs) => {
      const eventId = resolveEventId(args.eventId);
      const result = await executeTool('get_newsroom_link', {}, makeCtx(eventId));
      return textResult(result);
    },
  );

  return server;
}

/**
 * Mount the MCP server on an Express app at /mcp using Streamable HTTP transport.
 * Each MCP session gets its own McpServer instance with independent state.
 * Requires Bearer token authentication — the existing bearerAuthentication middleware
 * sets req.session.clientId from a valid AuthorizationAccessToken.
 */
export function mountMcp(app: Express, botClientId: number) {
  const transports = new Map<string, { transport: any; clientId: number }>();

  app.all('/mcp', async (req: Request, res: Response) => {
    // Authentication gate — return RFC 9728 resource metadata hint on 401
    const clientId = (req as any).session?.clientId as number | undefined;
    if (!clientId) {
      const serverUrl = process.env.API_URL || 'https://tunnel1337.zehua.li';
      return res.status(401)
        .set('WWW-Authenticate', `Bearer resource_metadata="${serverUrl}/.well-known/oauth-protected-resource"`)
        .json({ error: 'Authentication required' });
    }

    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (sessionId && transports.has(sessionId)) {
      const entry = transports.get(sessionId)!;
      if (entry.clientId !== clientId) {
        return res.status(403).json({ error: 'Session does not belong to this user' });
      }
      await entry.transport.handleRequest(req, res, req.body);
      return;
    }

    if (sessionId && !transports.has(sessionId)) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // New session
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
    const server = createMcpServer(botClientId, clientId);

    transport.onclose = () => {
      if (transport.sessionId) {
        transports.delete(transport.sessionId);
      }
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    if (transport.sessionId) {
      transports.set(transport.sessionId, { transport, clientId });
    }
  });

  console.log('MCP server mounted at /mcp (authentication required)');
}
