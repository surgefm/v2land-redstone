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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTool = exports.TOOL_DEFINITIONS = void 0;
const exa_js_1 = __importDefault(require("exa-js"));
const crypto_1 = require("crypto");
const _Models_1 = require("@Models");
const EventService = __importStar(require("@Services/EventService"));
const StackService = __importStar(require("@Services/StackService"));
const AlgoliaService = __importStar(require("@Services/AlgoliaService"));
const RecordService = __importStar(require("@Services/RecordService"));
const ChatService = __importStar(require("@Services/ChatService"));
const RedisService = __importStar(require("@Services/RedisService"));
const AccessControlService_1 = require("@Services/AccessControlService");
const AgentLock = __importStar(require("./lock"));
const mcpInstruction_1 = require("../../mcp/mcpInstruction");
let _exa = null;
function getExa() {
    if (!_exa) {
        _exa = new exa_js_1.default(process.env.EXA_API_KEY);
    }
    return _exa;
}
exports.TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'search_news',
            description: 'Search for news articles about a topic using web search. Use this to find news relevant to the timeline. Supports date range filtering — use startDate to search further back for timelines that have not been updated recently.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query describing the news topic to find',
                    },
                    numResults: {
                        type: 'number',
                        description: 'Number of results to return (default 20, max 40)',
                    },
                    startDate: {
                        type: 'string',
                        description: 'Start of date range for article publication (ISO 8601 date, e.g. "2025-01-15"). Defaults to 7 days ago. Use an earlier date for timelines that have not been updated recently.',
                    },
                    endDate: {
                        type: 'string',
                        description: 'End of date range for article publication (ISO 8601 date). Defaults to today.',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_current_stacks',
            description: 'Get the current state of the timeline, including all stacks (progress entries), their news items, and off-shelf news. Call this to understand what already exists before making changes.',
            parameters: {
                type: 'object',
                properties: {},
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'create_stack',
            description: 'Create a new progress entry (stack) in the timeline. Each stack represents a distinct development in the event.',
            parameters: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Brief title describing this development',
                    },
                    description: {
                        type: 'string',
                        description: 'Factual, detailed summary of what happened (2-4 sentences)',
                    },
                    time: {
                        type: 'string',
                        description: 'When the real-world development described by this stack actually took place (ISO 8601 format). This should be the date of the event itself, not the article publication date.',
                    },
                    order: {
                        type: 'number',
                        description: 'Display order (higher = more recent, default -1 for auto)',
                    },
                },
                required: ['title', 'description', 'time'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'add_news_to_event',
            description: 'Add a news article to the event. Optionally assign it to a specific stack. The news will appear in the newsroom.',
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'URL of the news article',
                    },
                    source: {
                        type: 'string',
                        description: 'Name of the news source/outlet',
                    },
                    title: {
                        type: 'string',
                        description: 'Title of the news article',
                    },
                    abstract: {
                        type: 'string',
                        description: 'Brief summary of the article (max 200 chars)',
                    },
                    time: {
                        type: 'string',
                        description: 'Publication time (ISO 8601 format)',
                    },
                    stackId: {
                        type: 'number',
                        description: 'ID of the stack to add this news to (optional, omit to add off-shelf)',
                    },
                },
                required: ['url', 'source', 'title', 'time'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'add_news_to_stack',
            description: 'Move an existing news item into a specific stack.',
            parameters: {
                type: 'object',
                properties: {
                    newsId: {
                        type: 'number',
                        description: 'ID of the news item to move',
                    },
                    stackId: {
                        type: 'number',
                        description: 'ID of the stack to add the news to',
                    },
                },
                required: ['newsId', 'stackId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'update_stack',
            description: 'Update an existing stack\'s title, description, or time.',
            parameters: {
                type: 'object',
                properties: {
                    stackId: {
                        type: 'number',
                        description: 'ID of the stack to update',
                    },
                    description: {
                        type: 'string',
                        description: 'New description for the stack',
                    },
                    title: {
                        type: 'string',
                        description: 'New title for the stack',
                    },
                    time: {
                        type: 'string',
                        description: 'New date/time for when the development described by this stack actually took place (ISO 8601 format)',
                    },
                },
                required: ['stackId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'reorder_stacks',
            description: 'Rearrange the display order of stacks in the timeline. Provide stack IDs in the desired order, from most recent (first) to oldest (last).',
            parameters: {
                type: 'object',
                properties: {
                    stackIds: {
                        type: 'array',
                        items: { type: 'number' },
                        description: 'Array of stack IDs in desired display order (most recent first)',
                    },
                },
                required: ['stackIds'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'send_chat_message',
            description: 'Send a message to the newsroom chatroom. Use this to report progress, share findings, or communicate with editors.',
            parameters: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: 'Message text to send',
                    },
                },
                required: ['text'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'ask_user_question',
            description: 'Ask the user a clarification question with multiple-choice options. The user can pick one of the provided options or reply with a free-form answer. Use this when the user\'s instructions are ambiguous and you need clarification before proceeding. This tool will pause execution and wait for the user\'s response.',
            parameters: {
                type: 'object',
                properties: {
                    question: {
                        type: 'string',
                        description: 'The clarification question to ask the user',
                    },
                    options: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of multiple-choice options for the user to choose from (2-6 options)',
                    },
                },
                required: ['question', 'options'],
            },
        },
    },
];
function recordData(data, ctx) {
    const plain = typeof (data === null || data === void 0 ? void 0 : data.get) === 'function' ? data.get({ plain: true }) : data;
    if (ctx.source === 'mcp') {
        return Object.assign(Object.assign({}, plain), { viaMcp: true });
    }
    return plain;
}
function executeTool(name, args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            switch (name) {
                case 'search_news':
                    return yield searchNews(args, ctx);
                case 'get_current_stacks':
                    return yield getCurrentStacks(ctx);
                case 'create_stack':
                    return yield createStack(args, ctx);
                case 'add_news_to_event':
                    return yield addNewsToEvent(args, ctx);
                case 'add_news_to_stack':
                    return yield addNewsToStack(args, ctx);
                case 'update_stack':
                    return yield updateStack(args, ctx);
                case 'reorder_stacks':
                    return yield reorderStacks(args, ctx);
                case 'send_chat_message':
                    return yield sendChatMessage(args, ctx);
                case 'ask_user_question':
                    return yield askUserQuestion(args, ctx);
                case 'create_event':
                    return yield createEvent(args, ctx);
                case 'get_newsroom_link':
                    return yield getNewsroomLink(ctx);
                case 'update_event':
                    return yield updateEventTool(args, ctx);
                case 'remove_news_from_stack':
                    return yield removeNewsFromStack(args, ctx);
                case 'search_events':
                    return yield searchEventsInDb(args);
                case 'get_editorial_guidelines':
                    return yield getEditorialGuidelines();
                case 'get_followed_editable_events':
                    return yield getFollowedEditableEvents(ctx);
                case 'get_owned_editable_events':
                    return yield getOwnedEditableEvents(ctx);
                default:
                    return JSON.stringify({ error: `Unknown tool: ${name}` });
            }
        }
        catch (err) {
            return JSON.stringify({ error: err.message || String(err) });
        }
    });
}
exports.executeTool = executeTool;
function searchNews(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const numResults = Math.min(args.numResults || 20, 40);
        // Default to 7 days ago if not specified
        const startDate = args.startDate || (() => {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            return d.toISOString().split('T')[0];
        })();
        const searchOptions = {
            category: 'news',
            numResults,
            startPublishedDate: startDate,
            contents: {
                text: { maxCharacters: 500 },
            },
        };
        if (args.endDate) {
            searchOptions.endPublishedDate = args.endDate;
        }
        const result = yield getExa().search(args.query, searchOptions);
        const articles = result.results.map((r) => ({
            title: r.title,
            url: r.url,
            publishedDate: r.publishedDate,
            author: r.author,
            text: r.text,
        }));
        return JSON.stringify({ articles, count: articles.length });
    });
}
function getCurrentStacks(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield EventService.findEvent(ctx.eventId, {
            plain: true,
            getNewsroomContent: true,
        });
        if (!event) {
            return JSON.stringify({ error: 'Event not found' });
        }
        const stacks = (event.stacks || []).map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            status: s.status,
            order: s.order,
            time: s.time,
            news: (s.news || []).map((n) => ({
                id: n.id,
                title: n.title,
                url: n.url,
                source: n.source,
                time: n.time,
                abstract: n.abstract,
            })),
        }));
        const offshelfNews = (event.offshelfNews || []).map((n) => ({
            id: n.id,
            title: n.title,
            url: n.url,
            source: n.source,
            time: n.time,
            abstract: n.abstract,
        }));
        return JSON.stringify({
            eventName: event.name,
            eventDescription: event.description,
            stacks,
            offshelfNews,
        });
    });
}
function createStack(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = yield StackService.createStack(ctx.eventId, {
            title: args.title,
            description: args.description,
            time: new Date(args.time),
            order: args.order || -1,
        }, ctx.clientId);
        return JSON.stringify({
            success: true,
            stackId: stack.id,
            title: stack.title,
        });
    });
}
function addNewsToEvent(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        let newsId;
        let created = false;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            let news = yield _Models_1.News.findOne({
                where: { url: args.url },
                transaction,
            });
            if (news) {
                const existing = yield _Models_1.EventStackNews.findOne({
                    where: { eventId: ctx.eventId, newsId: news.id },
                });
                if (existing) {
                    throw new Error(`News with this URL already exists in the event (newsId: ${news.id})`);
                }
            }
            const time = new Date();
            if (!news) {
                news = yield _Models_1.News.create({
                    url: args.url,
                    source: args.source,
                    title: args.title,
                    abstract: args.abstract ? args.abstract.slice(0, 200) : undefined,
                    time: new Date(args.time),
                    status: 'admitted',
                }, { transaction });
                created = true;
                yield RecordService.create({
                    model: 'News',
                    data: recordData(news, ctx),
                    target: news.id,
                    action: 'createNews',
                    owner: ctx.clientId,
                    createdAt: time,
                }, { transaction });
            }
            newsId = news.id;
            const eventStackNews = yield _Models_1.EventStackNews.create({
                eventId: ctx.eventId,
                stackId: args.stackId || undefined,
                newsId: news.id,
            }, { transaction });
            yield RecordService.create({
                model: 'EventStackNews',
                data: recordData(eventStackNews, ctx),
                target: ctx.eventId,
                subtarget: news.id,
                action: 'addNewsToEvent',
                owner: ctx.clientId,
                createdAt: time,
            }, { transaction });
            if (args.stackId) {
                yield RecordService.create({
                    model: 'EventStackNews',
                    data: recordData(eventStackNews, ctx),
                    target: args.stackId,
                    subtarget: news.id,
                    action: 'addNewsToStack',
                    owner: ctx.clientId,
                    createdAt: time,
                }, { transaction });
            }
            // Emit socket events for real-time newsroom updates
            const socket = yield EventService.getNewsroomSocket(ctx.eventId);
            const event = yield EventService.findEvent(ctx.eventId, { eventOnly: true });
            const client = yield _Models_1.Client.findByPk(ctx.clientId);
            socket.emit('add news to event', {
                eventStackNews,
                event,
                news,
                client,
            });
            if (args.stackId) {
                const stack = yield _Models_1.Stack.findByPk(args.stackId, { transaction });
                socket.emit('add news to stack', {
                    eventStackNews,
                    stack,
                    news,
                    client,
                });
            }
        }));
        return JSON.stringify({
            success: true,
            newsId: newsId,
            created,
            stackId: args.stackId || null,
        });
    });
}
function addNewsToStack(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield StackService.addNews(args.stackId, args.newsId, ctx.clientId);
        return JSON.stringify({
            success: true,
            newsId: args.newsId,
            stackId: args.stackId,
        });
    });
}
function updateStack(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {};
        if (args.description !== undefined)
            data.description = args.description;
        if (args.title !== undefined)
            data.title = args.title;
        if (args.time !== undefined)
            data.time = new Date(args.time);
        const result = yield StackService.updateStack({
            id: args.stackId,
            data,
            clientId: ctx.clientId,
        });
        if (result.status === 201) {
            const socket = yield EventService.getNewsroomSocket(ctx.eventId);
            socket.emit('update stack', result.message);
        }
        return JSON.stringify({
            success: true,
            stackId: args.stackId,
            message: result.message.message,
        });
    });
}
function reorderStacks(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const stacks = args.stackIds.map((stackId, index) => ({
            stackId,
            order: args.stackIds.length - 1 - index, // First in array gets highest order
        }));
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const queue = stacks.map(({ stackId, order }) => StackService.updateStack({
                id: stackId,
                data: { order },
                clientId: ctx.clientId,
                transaction,
            }));
            yield Promise.all(queue);
            yield RecordService.create({
                model: 'Event',
                target: ctx.eventId,
                owner: ctx.clientId,
                action: 'updateStackOrders',
                data: recordData({ stacks }, ctx),
            }, { transaction });
        }));
        const socket = yield EventService.getNewsroomSocket(ctx.eventId);
        socket.emit('update stack orders', {
            eventId: ctx.eventId,
            stacks,
        });
        return JSON.stringify({
            success: true,
            newOrder: stacks,
        });
    });
}
function sendChatMessage(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ChatService.sendMessage('newsroom', ctx.clientId, args.text, ctx.eventId);
        return JSON.stringify({ success: true });
    });
}
const QUESTION_POLL_INTERVAL_MS = 2000;
const QUESTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
function askUserQuestion(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // Format the question with numbered options
        const optionLines = args.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
        const formattedMessage = [
            `❓ ${args.question}`,
            '',
            optionLines,
            '',
            '请回复选项编号，或直接输入你的想法。',
        ].join('\n');
        // Send the question as a chat message
        yield ChatService.sendMessage('newsroom', ctx.botClientId, formattedMessage, ctx.eventId);
        // Persist + emit status so the UI shows we're waiting
        const waitingStatus = '等待用户回复...';
        const timestamp = new Date().toISOString();
        try {
            yield _Models_1.AgentStatus.create({
                id: (0, crypto_1.randomUUID)(),
                runId: ctx.runId,
                eventId: ctx.eventId,
                type: 'status',
                status: waitingStatus,
                authorId: ctx.botClientId,
            });
        }
        catch (err) {
            console.error('[AgentService] Failed to persist agent status:', err.message);
        }
        const socket = yield EventService.getNewsroomSocket(ctx.eventId);
        socket.emit('agent status', { eventId: ctx.eventId, status: waitingStatus, runId: ctx.runId, timestamp });
        // Poll the inbox until the user responds or we time out
        const startTime = Date.now();
        while (Date.now() - startTime < QUESTION_TIMEOUT_MS) {
            // Check if agent was stopped
            if (yield AgentLock.shouldStop(ctx.eventId)) {
                return JSON.stringify({ error: 'Agent was stopped while waiting for user response.' });
            }
            const inboxMessages = yield AgentLock.drainInbox(ctx.eventId);
            if (inboxMessages.length > 0) {
                const userReply = inboxMessages.join('\n');
                // Parse if the user replied with an option number
                const trimmed = userReply.trim();
                const optionNum = parseInt(trimmed, 10);
                if (optionNum >= 1 && optionNum <= args.options.length && trimmed === String(optionNum)) {
                    return JSON.stringify({
                        selectedOption: optionNum,
                        selectedText: args.options[optionNum - 1],
                        rawResponse: userReply,
                    });
                }
                // Free-form response
                return JSON.stringify({
                    selectedOption: null,
                    selectedText: null,
                    rawResponse: userReply,
                });
            }
            // Wait before polling again
            yield new Promise(resolve => setTimeout(resolve, QUESTION_POLL_INTERVAL_MS));
            // Refresh the lock TTL so it doesn't expire while we wait
            yield AgentLock.refreshLock(ctx.eventId);
        }
        return JSON.stringify({ error: 'No response received within the time limit.' });
    });
}
function createEvent(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield EventService.findEvent(args.name);
        if (existing) {
            throw new Error('An event with this name already exists.');
        }
        const pinyin = yield EventService.generatePinyin(args.name);
        let event;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            event = yield _Models_1.Event.create({
                name: args.name,
                description: args.description,
                status: 'admitted',
                pinyin,
                ownerId: ctx.clientId,
            }, { transaction });
            yield RecordService.create({
                model: 'Event',
                data: recordData(event, ctx),
                action: 'createEvent',
                owner: ctx.clientId,
                target: event.id,
            }, { transaction });
        }));
        yield (0, AccessControlService_1.setClientEventOwner)(ctx.clientId, event.id);
        const client = yield _Models_1.Client.findByPk(ctx.clientId);
        const username = (client === null || client === void 0 ? void 0 : client.username) || 'surge';
        yield RedisService.set(RedisService.getEventIdKey(event.name, event.ownerId), event.id);
        yield RedisService.set(RedisService.getEventIdKey(event.name, username), event.id);
        return JSON.stringify({
            success: true,
            eventId: event.id,
            name: event.name,
            pinyin: event.pinyin,
        });
    });
}
function getNewsroomLink(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield EventService.findEvent(ctx.eventId, { eventOnly: true });
        if (!event) {
            throw new Error('Event not found.');
        }
        const client = yield _Models_1.Client.findByPk(event.ownerId);
        const username = (client === null || client === void 0 ? void 0 : client.username) || 'surge';
        const siteBase = process.env.SITE_URL || 'https://langchao.org';
        const eventPath = `/@${username}/${Math.abs(event.id)}-${event.pinyin}`;
        const newsroomUrl = `${siteBase}${eventPath}/newsroom`;
        return JSON.stringify({
            success: true,
            eventId: event.id,
            eventName: event.name,
            newsroomUrl,
        });
    });
}
function updateEventTool(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const event = yield EventService.findEvent(ctx.eventId, { eventOnly: true });
        if (!event) {
            throw new Error('Event not found.');
        }
        const client = yield _Models_1.Client.findByPk(ctx.clientId);
        if (!client) {
            throw new Error('Client not found.');
        }
        const updated = yield EventService.updateEvent(event, args, client);
        const socket = yield EventService.getNewsroomSocket(ctx.eventId);
        socket.emit('update event', updated);
        return JSON.stringify({
            success: true,
            eventId: updated.id,
            name: updated.name,
            description: updated.description,
        });
    });
}
function removeNewsFromStack(args, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        yield StackService.removeNews(args.stackId, args.newsId, ctx.clientId);
        const socket = yield EventService.getNewsroomSocket(ctx.eventId);
        socket.emit('remove news from stack', {
            newsId: args.newsId,
            stackId: args.stackId,
            eventId: ctx.eventId,
        });
        return JSON.stringify({
            success: true,
            newsId: args.newsId,
            stackId: args.stackId,
        });
    });
}
function searchEventsInDb(args) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const hits = yield AlgoliaService.searchEvents(args.query, (_a = args.page) !== null && _a !== void 0 ? _a : 1);
        return JSON.stringify({
            results: hits,
            count: hits.length,
        });
    });
}
function getEditorialGuidelines() {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.stringify({ guidelines: mcpInstruction_1.SYSTEM_PROMPT });
    });
}
function getFollowedEditableEvents(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const subscriptions = yield _Models_1.Subscription.findAll({
            where: { subscriber: ctx.clientId, status: 'active' },
            include: [{ model: _Models_1.Event, as: 'event' }],
        });
        const results = [];
        for (const sub of subscriptions) {
            const event = sub.event;
            if (!event || event.status === 'removed')
                continue;
            if (yield (0, AccessControlService_1.isAllowedToEditEvent)(ctx.clientId, event.id)) {
                results.push({
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    status: event.status,
                });
            }
        }
        return JSON.stringify({ events: results, count: results.length });
    });
}
function getOwnedEditableEvents(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const events = yield _Models_1.Event.findAll({
            where: { ownerId: ctx.clientId },
            attributes: ['id', 'name', 'description', 'status'],
            order: [['id', 'DESC']],
        });
        const results = events
            .filter(e => e.status !== 'removed')
            .map(e => ({
            id: e.id,
            name: e.name,
            description: e.description,
            status: e.status,
        }));
        return JSON.stringify({ events: results, count: results.length });
    });
}

//# sourceMappingURL=tools.js.map
