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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const openai_1 = __importDefault(require("openai"));
const crypto_1 = require("crypto");
const EventService = __importStar(require("@Services/EventService"));
const ChatService = __importStar(require("@Services/ChatService"));
const _Models_1 = require("@Models");
const prompt_1 = require("./prompt");
const tools_1 = require("./tools");
const botClient_1 = require("./botClient");
const ensureBotAccess_1 = require("./ensureBotAccess");
const AgentLock = __importStar(require("./lock"));
const MAX_ITERATIONS = 50;
const THINKING_FLUSH_INTERVAL_MS = 100;
const THINKING_FLUSH_SIZE = 200;
function emitAgentStatus(eventId, status, runId, botClientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const timestamp = new Date().toISOString();
        if (status !== null) {
            try {
                yield _Models_1.AgentStatus.create({
                    id: (0, crypto_1.randomUUID)(),
                    runId,
                    eventId,
                    type: 'status',
                    status,
                    authorId: botClientId,
                });
            }
            catch (err) {
                console.error('[AgentService] Failed to persist agent status:', err.message);
            }
        }
        const socket = yield EventService.getNewsroomSocket(eventId);
        socket.emit('agent status', { eventId, status, runId, timestamp });
    });
}
function getToolStatusMessage(toolName, args) {
    switch (toolName) {
        case 'search_news':
            return `正在搜索：${args.query || ''}`;
        case 'get_current_stacks':
            return '正在获取当前时间线状态...';
        case 'create_stack':
            return `正在创建进展：${args.title || ''}`;
        case 'add_news_to_event':
            return `正在添加新闻：${args.title || ''}`;
        case 'add_news_to_stack':
            return `正在将新闻归入进展...`;
        case 'update_stack':
            return `正在更新进展：${args.title || `ID ${args.stackId}`}`;
        case 'reorder_stacks':
            return '正在调整进展排序...';
        case 'send_chat_message':
            return null; // Don't emit status for chat messages themselves
        case 'ask_user_question':
            return `正在向用户提问：${args.question || ''}`;
        default:
            return null;
    }
}
function run(eventId, userMessage) {
    var _a, e_1, _b, _c;
    var _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const botClient = yield (0, botClient_1.getOrCreateBotClient)();
        const botClientId = botClient.id;
        const runId = (0, crypto_1.randomUUID)();
        // Try to acquire lock
        const acquired = yield AgentLock.acquireLock(eventId);
        if (!acquired) {
            // Agent already running — push message to inbox for mid-run correction
            if (userMessage) {
                yield AgentLock.pushToInbox(eventId, userMessage);
            }
            return;
        }
        try {
            // Check bot has edit access to this event
            const hasAccess = yield (0, ensureBotAccess_1.ensureBotAccess)(eventId);
            if (!hasAccess)
                return;
            // Load chat history for context
            const recentMessages = yield ChatService.loadMessages('newsroom', eventId);
            const chatHistory = recentMessages
                .reverse() // loadMessages returns DESC, we want chronological
                .map((m) => {
                const plain = m.get ? m.get({ plain: true }) : m;
                return `[${plain.authorId === botClientId ? 'Bot' : `User ${plain.authorId}`}]: ${plain.text}`;
            })
                .join('\n');
            // Load current event state
            const event = yield EventService.findEvent(eventId, { plain: true, getNewsroomContent: true });
            if (!event) {
                yield ChatService.sendMessage('newsroom', botClientId, '未找到该事件。', eventId);
                return;
            }
            // Build initial context for the LLM
            const eventContext = buildEventContext(event);
            const messages = [
                { role: 'system', content: prompt_1.SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        `## 当前时间`,
                        `现在是 ${new Date().toISOString()}（UTC时间）`,
                        `## 当前事件信息`,
                        eventContext,
                        `## 近期编辑室聊天记录`,
                        chatHistory || '（无聊天记录）',
                        `## 用户指示`,
                        userMessage || '请更新时间线，搜索最新的相关新闻。',
                    ].join('\n\n'),
                },
            ];
            const openai = new openai_1.default({
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: process.env.OPEN_ROUTER_API_KEY,
            });
            const ctx = { eventId, clientId: botClientId, botClientId, runId };
            // Agentic tool-calling loop
            for (let i = 0; i < MAX_ITERATIONS; i++) {
                // Check stop flag
                if (yield AgentLock.shouldStop(eventId)) {
                    yield ChatService.sendMessage('newsroom', botClientId, 'Bot 已被手动停止。', eventId);
                    break;
                }
                let assistantMessage;
                try {
                    const abortController = new AbortController();
                    const stream = yield openai.chat.completions.create({
                        model: 'deepseek/deepseek-v3.2',
                        messages,
                        tools: tools_1.TOOL_DEFINITIONS,
                        tool_choice: 'auto',
                        reasoning: { effort: 'low' },
                        stream: true,
                    }, { signal: abortController.signal });
                    // Process stream — accumulate content, reasoning, and tool_calls
                    let accumulatedContent = '';
                    let accumulatedReasoning = '';
                    const toolCallsMap = new Map();
                    // Buffer for thinking chunks to reduce socket emissions
                    let thinkingBuffer = '';
                    let lastThinkingFlush = Date.now();
                    let tokenCount = 0;
                    const newsroomSocket = yield EventService.getNewsroomSocket(eventId);
                    try {
                        for (var _j = true, stream_1 = (e_1 = void 0, __asyncValues(stream)), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a;) {
                            _c = stream_1_1.value;
                            _j = false;
                            try {
                                const chunk = _c;
                                const delta = (_e = (_d = chunk.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.delta;
                                if (!delta)
                                    continue;
                                tokenCount++;
                                // Periodically check if agent should stop
                                if (tokenCount % 50 === 0 && (yield AgentLock.shouldStop(eventId))) {
                                    abortController.abort();
                                    break;
                                }
                                // Handle reasoning/thinking — OpenRouter returns reasoning in `reasoning` or `reasoning_content`
                                const reasoningChunk = delta.reasoning_content || delta.reasoning;
                                if (reasoningChunk) {
                                    accumulatedReasoning += reasoningChunk;
                                    thinkingBuffer += reasoningChunk;
                                    const now = Date.now();
                                    if (now - lastThinkingFlush >= THINKING_FLUSH_INTERVAL_MS || thinkingBuffer.length > THINKING_FLUSH_SIZE) {
                                        newsroomSocket.emit('agent thinking', {
                                            eventId,
                                            runId,
                                            chunk: thinkingBuffer,
                                            done: false,
                                        });
                                        thinkingBuffer = '';
                                        lastThinkingFlush = now;
                                    }
                                }
                                // Handle content
                                if (delta.content) {
                                    accumulatedContent += delta.content;
                                }
                                // Handle tool_calls
                                if (delta.tool_calls) {
                                    for (const tc of delta.tool_calls) {
                                        if (!toolCallsMap.has(tc.index)) {
                                            toolCallsMap.set(tc.index, { id: tc.id || '', name: '', arguments: '' });
                                        }
                                        const existing = toolCallsMap.get(tc.index);
                                        if (tc.id)
                                            existing.id = tc.id;
                                        if ((_f = tc.function) === null || _f === void 0 ? void 0 : _f.name)
                                            existing.name += tc.function.name;
                                        if ((_g = tc.function) === null || _g === void 0 ? void 0 : _g.arguments)
                                            existing.arguments += tc.function.arguments;
                                    }
                                }
                            }
                            finally {
                                _j = true;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_j && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    // Flush remaining thinking buffer
                    if (thinkingBuffer.length > 0) {
                        newsroomSocket.emit('agent thinking', {
                            eventId,
                            runId,
                            chunk: thinkingBuffer,
                            done: true,
                        });
                    }
                    else if (accumulatedReasoning.length > 0) {
                        newsroomSocket.emit('agent thinking', {
                            eventId,
                            runId,
                            chunk: '',
                            done: true,
                        });
                    }
                    // Persist accumulated reasoning as a single record per LLM call
                    if (accumulatedReasoning.length > 0) {
                        try {
                            yield _Models_1.AgentStatus.create({
                                id: (0, crypto_1.randomUUID)(),
                                runId,
                                eventId,
                                type: 'thinking',
                                status: accumulatedReasoning,
                                authorId: botClientId,
                            });
                        }
                        catch (err) {
                            console.error('[AgentService] Failed to persist agent thinking:', err.message);
                        }
                    }
                    // Reconstruct the assistant message in the same shape as non-streaming
                    const toolCalls = toolCallsMap.size > 0
                        ? Array.from(toolCallsMap.values()).map(tc => ({
                            id: tc.id,
                            type: 'function',
                            function: { name: tc.name, arguments: tc.arguments },
                        }))
                        : undefined;
                    assistantMessage = {
                        role: 'assistant',
                        content: accumulatedContent || null,
                        tool_calls: toolCalls,
                    };
                }
                catch (apiError) {
                    if (apiError.name === 'AbortError') {
                        // Agent was stopped mid-stream
                        yield ChatService.sendMessage('newsroom', botClientId, 'Bot 已被手动停止。', eventId);
                        break;
                    }
                    console.error('[AgentService] API call failed:', apiError.message, apiError.status, JSON.stringify((_h = apiError.error) !== null && _h !== void 0 ? _h : {}));
                    yield ChatService.sendMessage('newsroom', botClientId, `AI 服务调用失败：${apiError.message}`, eventId);
                    break;
                }
                messages.push(assistantMessage);
                // Emit agent's reasoning text as ephemeral status
                // (skip if the message also has tool_calls — that content is internal reasoning)
                if (assistantMessage.content && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
                    yield emitAgentStatus(eventId, assistantMessage.content, runId, botClientId);
                }
                // If no tool calls, the agent is done
                if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
                    break;
                }
                // Execute tool calls
                let askedQuestion = false;
                for (const toolCall of assistantMessage.tool_calls) {
                    const fn = toolCall.function;
                    let args;
                    try {
                        args = JSON.parse(fn.arguments);
                    }
                    catch (_k) {
                        args = {};
                    }
                    // Emit status before tool execution
                    const statusMsg = getToolStatusMessage(fn.name, args);
                    if (statusMsg) {
                        yield emitAgentStatus(eventId, statusMsg, runId, botClientId);
                    }
                    const result = yield (0, tools_1.executeTool)(fn.name, args, ctx);
                    if (fn.name === 'ask_user_question') {
                        askedQuestion = true;
                    }
                    // Emit result summary for search
                    if (fn.name === 'search_news') {
                        try {
                            const parsed = JSON.parse(result);
                            yield emitAgentStatus(eventId, `找到 ${parsed.count || 0} 篇相关文章`, runId, botClientId);
                        }
                        catch (_l) { }
                    }
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: result,
                    });
                }
                // Check inbox for mid-run corrections (skip if ask_user_question
                // already drained the inbox to get the user's answer)
                if (!askedQuestion) {
                    const inboxMessages = yield AgentLock.drainInbox(eventId);
                    if (inboxMessages.length > 0) {
                        const correction = inboxMessages.join('\n\n');
                        messages.push({
                            role: 'user',
                            content: `[编辑室新消息] ${correction}`,
                        });
                    }
                }
            }
            // Ensure a persistent chat message is always sent when the agent finishes,
            // so the user is never left wondering what happened.
            // Only use content from the last assistant message that has NO tool_calls
            // (messages with tool_calls are intermediate reasoning, not user-facing).
            const lastFinalAssistantMsg = [...messages].reverse().find(m => { var _a; return m.role === 'assistant' && !('tool_calls' in m && ((_a = m.tool_calls) === null || _a === void 0 ? void 0 : _a.length) > 0); });
            let finalText = lastFinalAssistantMsg && 'content' in lastFinalAssistantMsg
                ? lastFinalAssistantMsg.content
                : null;
            // Strip any raw function-call XML markup that some models may leak into content
            if (finalText) {
                finalText = finalText.replace(/<function_call>[\s\S]*?<\/function_call>/g, '').trim();
                finalText = finalText.replace(/<\/?function_call>/g, '').trim();
            }
            if (finalText) {
                yield ChatService.sendMessage('newsroom', botClientId, finalText, eventId);
            }
            else {
                yield ChatService.sendMessage('newsroom', botClientId, '已完成本次更新。', eventId);
            }
            // Signal agent completion
            yield emitAgentStatus(eventId, null, runId, botClientId);
        }
        catch (err) {
            console.error(`[AgentService] Error running agent for event ${eventId}:`, err);
            try {
                const botClient = yield (0, botClient_1.getOrCreateBotClient)();
                yield ChatService.sendMessage('newsroom', botClient.id, `运行出错：${err.message || '未知错误'}`, eventId);
                yield emitAgentStatus(eventId, null, runId, botClient.id);
            }
            catch (_m) {
                // Ignore chat send errors during error handling
            }
        }
        finally {
            yield AgentLock.releaseLock(eventId);
        }
    });
}
exports.run = run;
function buildEventContext(event) {
    const lines = [
        `事件名称: ${event.name}`,
        `事件描述: ${event.description || '（无描述）'}`,
    ];
    if (event.tags && event.tags.length > 0) {
        lines.push(`标签: ${event.tags.map((t) => t.name).join(', ')}`);
    }
    if (event.stacks && event.stacks.length > 0) {
        lines.push(`\n### 现有进展 (${event.stacks.length}个):`);
        for (const stack of event.stacks) {
            lines.push(`- [ID:${stack.id}] ${stack.title} (${stack.status}, order:${stack.order}, time:${stack.time || '未知'})`);
            if (stack.description) {
                lines.push(`  描述: ${stack.description}`);
            }
            if (stack.news && stack.news.length > 0) {
                for (const news of stack.news) {
                    lines.push(`  - [NewsID:${news.id}] ${news.title} (${news.source}, ${news.time || '未知'}) ${news.url}`);
                }
            }
        }
    }
    else {
        lines.push('\n时间线当前没有进展条目。');
    }
    if (event.offshelfNews && event.offshelfNews.length > 0) {
        lines.push(`\n### 待整理新闻 (${event.offshelfNews.length}条):`);
        for (const news of event.offshelfNews) {
            lines.push(`- [NewsID:${news.id}] ${news.title} (${news.source}, ${news.time || '未知'}) ${news.url}`);
        }
    }
    return lines.join('\n');
}

//# sourceMappingURL=run.js.map
