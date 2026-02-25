"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountMcp = exports.createMcpServer = void 0;
const crypto_1 = require("crypto");
const mcpInstruction_1 = require("./mcpInstruction");
const tools_1 = require("@Services/AgentService/tools");
const sdk_1 = require("./sdk");
const schemas = __importStar(require("./toolSchemas"));
function createMcpServer(botClientId, clientId) {
    let sessionEventId = null;
    const runId = (0, crypto_1.randomUUID)();
    function resolveEventId(argsEventId) {
        const eventId = argsEventId !== null && argsEventId !== void 0 ? argsEventId : sessionEventId;
        if (!eventId) {
            throw new Error('No eventId provided and no session default set. Call set_event first or pass eventId.');
        }
        return eventId;
    }
    function makeCtx(eventId) {
        return { eventId, clientId, botClientId, runId, source: 'mcp' };
    }
    function textResult(text) {
        return { content: [{ type: 'text', text }] };
    }
    const server = new sdk_1.McpServer({ name: 'surge-newsroom', version: '1.0.0' }, { instructions: mcpInstruction_1.SYSTEM_PROMPT });
    server.registerTool('set_event', {
        description: 'Set the active event/timeline ID for this session. Once set, other tools will use it by default.',
        inputSchema: schemas.setEventSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        sessionEventId = args.eventId;
        return textResult(JSON.stringify({ success: true, eventId: args.eventId }));
    }));
    server.registerTool('get_current_stacks', {
        description: 'Get the current state of the timeline, including all stacks (progress entries), their news items, and off-shelf news. Call this to understand what already exists before making changes.',
        inputSchema: schemas.getCurrentStacksSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const eventId = resolveEventId(args.eventId);
        const result = yield (0, tools_1.executeTool)('get_current_stacks', {}, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('create_stack', {
        description: 'Create a new progress entry (stack) in the timeline. Each stack represents a distinct development in the event.',
        inputSchema: schemas.createStackSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('create_stack', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('add_news_to_event', {
        description: 'Add a news article to the event. Optionally assign it to a specific stack. The news will appear in the newsroom.',
        inputSchema: schemas.addNewsToEventSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('add_news_to_event', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('add_news_to_stack', {
        description: 'Move an existing news item into a specific stack.',
        inputSchema: schemas.addNewsToStackSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('add_news_to_stack', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('update_stack', {
        description: "Update an existing stack's title, description, or time.",
        inputSchema: schemas.updateStackSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('update_stack', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('reorder_stacks', {
        description: 'Rearrange the display order of stacks in the timeline. Provide stack IDs in the desired order, from most recent (first) to oldest (last).',
        inputSchema: schemas.reorderStacksSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('reorder_stacks', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('send_chat_message', {
        description: 'Send a message to the newsroom chatroom. Use this to report progress, share findings, or communicate with editors.',
        inputSchema: schemas.sendChatMessageSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('send_chat_message', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('create_event', {
        description: 'Create a new event/timeline. Returns the new event ID. Use set_event afterwards to start working on it.',
        inputSchema: schemas.createEventSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, tools_1.executeTool)('create_event', args, makeCtx(0));
        const parsed = JSON.parse(result);
        if (parsed.eventId) {
            sessionEventId = parsed.eventId;
        }
        return textResult(result);
    }));
    server.registerTool('get_newsroom_link', {
        description: 'Get the newsroom URL for the current event so the user can review the timeline in their browser.',
        inputSchema: schemas.getNewsroomLinkSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const eventId = resolveEventId(args.eventId);
        const result = yield (0, tools_1.executeTool)('get_newsroom_link', {}, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('update_event', {
        description: "Update the current event's name or description.",
        inputSchema: schemas.updateEventSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('update_event', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('remove_news_from_stack', {
        description: 'Move a news item out of a stack and back to off-shelf (unassign without deleting).',
        inputSchema: schemas.removeNewsFromStackSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const { eventId: argsEventId } = args, toolArgs = __rest(args, ["eventId"]);
        const eventId = resolveEventId(argsEventId);
        const result = yield (0, tools_1.executeTool)('remove_news_from_stack', toolArgs, makeCtx(eventId));
        return textResult(result);
    }));
    server.registerTool('search_events', {
        description: 'Search for events/timelines in the database by keyword. Returns matching events with their IDs. Use this to find an event ID before calling set_event.',
        inputSchema: schemas.searchEventsSchema,
    }, (args) => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, tools_1.executeTool)('search_events', args, makeCtx(0));
        return textResult(result);
    }));
    server.registerTool('get_editorial_guidelines', {
        description: 'Retrieve the editorial guidelines and workflow instructions for this newsroom assistant.',
        inputSchema: schemas.getEditorialGuidelinesSchema,
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, tools_1.executeTool)('get_editorial_guidelines', {}, makeCtx(0));
        return textResult(result);
    }));
    server.registerTool('get_followed_editable_events', {
        description: 'Get events the current user is following (subscribed to) that they also have edit permission for. Returns event IDs, names, descriptions, and statuses.',
        inputSchema: schemas.getFollowedEditableEventsSchema,
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, tools_1.executeTool)('get_followed_editable_events', {}, makeCtx(0));
        return textResult(result);
    }));
    server.registerTool('get_owned_editable_events', {
        description: 'Get events the current user owns. Owners always have edit permission. Returns event IDs, names, descriptions, and statuses.',
        inputSchema: schemas.getOwnedEditableEventsSchema,
    }, () => __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, tools_1.executeTool)('get_owned_editable_events', {}, makeCtx(0));
        return textResult(result);
    }));
    return server;
}
exports.createMcpServer = createMcpServer;
/**
 * Mount the MCP server on an Express app at /mcp using Streamable HTTP transport.
 * Each MCP session gets its own McpServer instance with independent state.
 * Requires Bearer token authentication — the existing bearerAuthentication middleware
 * sets req.session.clientId from a valid AuthorizationAccessToken.
 */
function mountMcp(app, botClientId) {
    const transports = new Map();
    app.all('/mcp', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Authentication gate — return RFC 9728 resource metadata hint on 401
        const clientId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.clientId;
        if (!clientId) {
            const serverUrl = process.env.API_URL || 'https://api.langchao.org';
            return res.status(401)
                .set('WWW-Authenticate', `Bearer resource_metadata="${serverUrl}/.well-known/oauth-protected-resource"`)
                .json({ error: 'Authentication required' });
        }
        const sessionId = req.headers['mcp-session-id'];
        if (sessionId && transports.has(sessionId)) {
            const entry = transports.get(sessionId);
            if (entry.clientId !== clientId) {
                return res.status(403).json({ error: 'Session does not belong to this user' });
            }
            yield entry.transport.handleRequest(req, res, req.body);
            return;
        }
        if (sessionId && !transports.has(sessionId)) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        // New session
        const transport = new sdk_1.StreamableHTTPServerTransport({
            sessionIdGenerator: () => (0, crypto_1.randomUUID)(),
        });
        const server = createMcpServer(botClientId, clientId);
        transport.onclose = () => {
            if (transport.sessionId) {
                transports.delete(transport.sessionId);
            }
        };
        yield server.connect(transport);
        yield transport.handleRequest(req, res, req.body);
        if (transport.sessionId) {
            transports.set(transport.sessionId, { transport, clientId });
        }
    }));
    console.log('MCP server mounted at /mcp (authentication required)');
}
exports.mountMcp = mountMcp;

//# sourceMappingURL=index.js.map
