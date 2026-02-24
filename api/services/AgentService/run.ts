import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionChunk } from 'openai/resources/chat/completions';
import type { Stream } from 'openai/streaming';
import { randomUUID } from 'crypto';
import * as EventService from '@Services/EventService';
import * as ChatService from '@Services/ChatService';
import { AgentStatus } from '@Models';
import { SYSTEM_PROMPT } from './prompt';
import { TOOL_DEFINITIONS, executeTool, ToolContext } from './tools';
import { getOrCreateBotClient } from './botClient';
import { ensureBotAccess } from './ensureBotAccess';
import * as AgentLock from './lock';

const MAX_ITERATIONS = 50;
const THINKING_FLUSH_INTERVAL_MS = 100;
const THINKING_FLUSH_SIZE = 200;

async function emitAgentStatus(eventId: number, status: string | null, runId: string, botClientId: number) {
  const timestamp = new Date().toISOString();
  if (status !== null) {
    try {
      await AgentStatus.create({
        id: randomUUID(),
        runId,
        eventId,
        type: 'status',
        status,
        authorId: botClientId,
      } as any);
    } catch (err: any) {
      console.error('[AgentService] Failed to persist agent status:', err.message);
    }
  }
  const socket = await EventService.getNewsroomSocket(eventId);
  socket.emit('agent status', { eventId, status, runId, timestamp });
}

function getToolStatusMessage(toolName: string, args: Record<string, any>): string | null {
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

export async function run(eventId: number, userMessage?: string): Promise<void> {
  const botClient = await getOrCreateBotClient();
  const botClientId = botClient.id;
  const runId = randomUUID();

  // Try to acquire lock
  const acquired = await AgentLock.acquireLock(eventId);
  if (!acquired) {
    // Agent already running — push message to inbox for mid-run correction
    if (userMessage) {
      await AgentLock.pushToInbox(eventId, userMessage);
    }
    return;
  }

  try {
    // Check bot has edit access to this event
    const hasAccess = await ensureBotAccess(eventId);
    if (!hasAccess) return;

    // Load chat history for context
    const recentMessages = await ChatService.loadMessages('newsroom', eventId);
    const chatHistory = recentMessages
      .reverse() // loadMessages returns DESC, we want chronological
      .map((m: any) => {
        const plain = m.get ? m.get({ plain: true }) : m;
        return `[${plain.authorId === botClientId ? 'Bot' : `User ${plain.authorId}`}]: ${plain.text}`;
      })
      .join('\n');

    // Load current event state
    const event = await EventService.findEvent(eventId, { plain: true, getNewsroomContent: true });
    if (!event) {
      await ChatService.sendMessage('newsroom', botClientId, '未找到该事件。', eventId);
      return;
    }

    // Build initial context for the LLM
    const eventContext = buildEventContext(event);

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
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

    const openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPEN_ROUTER_API_KEY,
    });

    const ctx: ToolContext = { eventId, botClientId, runId };

    // Agentic tool-calling loop
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // Check stop flag
      if (await AgentLock.shouldStop(eventId)) {
        await ChatService.sendMessage('newsroom', botClientId, 'Bot 已被手动停止。', eventId);
        break;
      }

      let assistantMessage: {
        role: 'assistant';
        content: string | null;
        tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
      };

      try {
        const abortController = new AbortController();
        const stream = await openai.chat.completions.create({
          model: 'deepseek/deepseek-v3.2',
          messages,
          tools: TOOL_DEFINITIONS,
          tool_choice: 'auto',
          reasoning: { effort: 'low' },
          stream: true,
        } as any, { signal: abortController.signal }) as unknown as Stream<ChatCompletionChunk>;

        // Process stream — accumulate content, reasoning, and tool_calls
        let accumulatedContent = '';
        let accumulatedReasoning = '';
        const toolCallsMap = new Map<number, { id: string; name: string; arguments: string }>();

        // Buffer for thinking chunks to reduce socket emissions
        let thinkingBuffer = '';
        let lastThinkingFlush = Date.now();
        let tokenCount = 0;

        const newsroomSocket = await EventService.getNewsroomSocket(eventId);

        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          tokenCount++;

          // Periodically check if agent should stop
          if (tokenCount % 50 === 0 && await AgentLock.shouldStop(eventId)) {
            abortController.abort();
            break;
          }

          // Handle reasoning/thinking — OpenRouter returns reasoning in `reasoning` or `reasoning_content`
          const reasoningChunk = (delta as any).reasoning_content || (delta as any).reasoning;
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
              const existing = toolCallsMap.get(tc.index)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name += tc.function.name;
              if (tc.function?.arguments) existing.arguments += tc.function.arguments;
            }
          }
        }

        // Flush remaining thinking buffer
        if (thinkingBuffer.length > 0) {
          newsroomSocket.emit('agent thinking', {
            eventId,
            runId,
            chunk: thinkingBuffer,
            done: true,
          });
        } else if (accumulatedReasoning.length > 0) {
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
            await AgentStatus.create({
              id: randomUUID(),
              runId,
              eventId,
              type: 'thinking',
              status: accumulatedReasoning,
              authorId: botClientId,
            } as any);
          } catch (err: any) {
            console.error('[AgentService] Failed to persist agent thinking:', err.message);
          }
        }

        // Reconstruct the assistant message in the same shape as non-streaming
        const toolCalls = toolCallsMap.size > 0
          ? Array.from(toolCallsMap.values()).map(tc => ({
              id: tc.id,
              type: 'function' as const,
              function: { name: tc.name, arguments: tc.arguments },
            }))
          : undefined;

        assistantMessage = {
          role: 'assistant',
          content: accumulatedContent || null,
          tool_calls: toolCalls,
        };
      } catch (apiError: any) {
        if (apiError.name === 'AbortError') {
          // Agent was stopped mid-stream
          await ChatService.sendMessage('newsroom', botClientId, 'Bot 已被手动停止。', eventId);
          break;
        }
        console.error('[AgentService] API call failed:', apiError.message, apiError.status, JSON.stringify(apiError.error ?? {}));
        await ChatService.sendMessage('newsroom', botClientId, `AI 服务调用失败：${apiError.message}`, eventId);
        break;
      }

      messages.push(assistantMessage as ChatCompletionMessageParam);

      // Emit agent's reasoning text as ephemeral status
      // (skip if the message also has tool_calls — that content is internal reasoning)
      if (assistantMessage.content && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
        await emitAgentStatus(eventId, assistantMessage.content, runId, botClientId);
      }

      // If no tool calls, the agent is done
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        break;
      }

      // Execute tool calls
      let askedQuestion = false;
      for (const toolCall of assistantMessage.tool_calls) {
        const fn = toolCall.function;
        let args: Record<string, any>;
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          args = {};
        }

        // Emit status before tool execution
        const statusMsg = getToolStatusMessage(fn.name, args);
        if (statusMsg) {
          await emitAgentStatus(eventId, statusMsg, runId, botClientId);
        }

        const result = await executeTool(fn.name, args, ctx);

        if (fn.name === 'ask_user_question') {
          askedQuestion = true;
        }

        // Emit result summary for search
        if (fn.name === 'search_news') {
          try {
            const parsed = JSON.parse(result);
            await emitAgentStatus(eventId, `找到 ${parsed.count || 0} 篇相关文章`, runId, botClientId);
          } catch {}
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
        const inboxMessages = await AgentLock.drainInbox(eventId);
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
    const lastFinalAssistantMsg = [...messages].reverse().find(
      m => m.role === 'assistant' && !('tool_calls' in m && (m as any).tool_calls?.length > 0),
    );
    let finalText = lastFinalAssistantMsg && 'content' in lastFinalAssistantMsg
      ? (lastFinalAssistantMsg.content as string)
      : null;

    // Strip any raw function-call XML markup that some models may leak into content
    if (finalText) {
      finalText = finalText.replace(/<function_call>[\s\S]*?<\/function_call>/g, '').trim();
      finalText = finalText.replace(/<\/?function_call>/g, '').trim();
    }

    if (finalText) {
      await ChatService.sendMessage('newsroom', botClientId, finalText, eventId);
    } else {
      await ChatService.sendMessage('newsroom', botClientId, '已完成本次更新。', eventId);
    }

    // Signal agent completion
    await emitAgentStatus(eventId, null, runId, botClientId);
  } catch (err: any) {
    console.error(`[AgentService] Error running agent for event ${eventId}:`, err);
    try {
      const botClient = await getOrCreateBotClient();
      await ChatService.sendMessage(
        'newsroom',
        botClient.id,
        `运行出错：${err.message || '未知错误'}`,
        eventId,
      );
      await emitAgentStatus(eventId, null, runId, botClient.id);
    } catch {
      // Ignore chat send errors during error handling
    }
  } finally {
    await AgentLock.releaseLock(eventId);
  }
}

function buildEventContext(event: any): string {
  const lines: string[] = [
    `事件名称: ${event.name}`,
    `事件描述: ${event.description || '（无描述）'}`,
  ];

  if (event.tags && event.tags.length > 0) {
    lines.push(`标签: ${event.tags.map((t: any) => t.name).join(', ')}`);
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
  } else {
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
