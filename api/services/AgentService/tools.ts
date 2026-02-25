import Exa from 'exa-js';
import { randomUUID } from 'crypto';
import { Client, News, Stack, EventStackNews, AgentStatus, sequelize } from '@Models';
import * as EventService from '@Services/EventService';
import * as StackService from '@Services/StackService';
import * as RecordService from '@Services/RecordService';
import * as ChatService from '@Services/ChatService';
import * as AgentLock from './lock';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

let _exa: Exa | null = null;
function getExa(): Exa {
  if (!_exa) {
    _exa = new Exa(process.env.EXA_API_KEY);
  }
  return _exa;
}

export interface ToolContext {
  eventId: number;
  clientId: number;
  botClientId: number;
  runId: string;
  source?: 'mcp' | 'agent';
}

export const TOOL_DEFINITIONS: ChatCompletionTool[] = [
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

function recordData(data: any, ctx: ToolContext): any {
  const plain = typeof data?.get === 'function' ? data.get({ plain: true }) : data;
  if (ctx.source === 'mcp') {
    return { ...plain, viaMcp: true };
  }
  return plain;
}

export async function executeTool(
  name: string,
  args: Record<string, any>,
  ctx: ToolContext,
): Promise<string> {
  try {
    switch (name) {
      case 'search_news':
        return await searchNews(args as any, ctx);
      case 'get_current_stacks':
        return await getCurrentStacks(ctx);
      case 'create_stack':
        return await createStack(args as any, ctx);
      case 'add_news_to_event':
        return await addNewsToEvent(args as any, ctx);
      case 'add_news_to_stack':
        return await addNewsToStack(args as any, ctx);
      case 'update_stack':
        return await updateStack(args as any, ctx);
      case 'reorder_stacks':
        return await reorderStacks(args as any, ctx);
      case 'send_chat_message':
        return await sendChatMessage(args as any, ctx);
      case 'ask_user_question':
        return await askUserQuestion(args as any, ctx);
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message || String(err) });
  }
}

async function searchNews(
  args: { query: string; numResults?: number; startDate?: string; endDate?: string },
  ctx: ToolContext,
): Promise<string> {
  const numResults = Math.min(args.numResults || 20, 40);

  // Default to 7 days ago if not specified
  const startDate = args.startDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  const searchOptions: any = {
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

  const result = await getExa().search(args.query, searchOptions);

  const articles = result.results.map((r: any) => ({
    title: r.title,
    url: r.url,
    publishedDate: r.publishedDate,
    author: r.author,
    text: r.text,
  }));

  return JSON.stringify({ articles, count: articles.length });
}

async function getCurrentStacks(ctx: ToolContext): Promise<string> {
  const event = await EventService.findEvent(ctx.eventId, {
    plain: true,
    getNewsroomContent: true,
  });

  if (!event) {
    return JSON.stringify({ error: 'Event not found' });
  }

  const stacks = (event.stacks || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    status: s.status,
    order: s.order,
    time: s.time,
    news: (s.news || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      url: n.url,
      source: n.source,
      time: n.time,
      abstract: n.abstract,
    })),
  }));

  const offshelfNews = (event.offshelfNews || []).map((n: any) => ({
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
}

async function createStack(
  args: { title: string; description: string; time: string; order?: number },
  ctx: ToolContext,
): Promise<string> {
  const stack = await StackService.createStack(
    ctx.eventId,
    {
      title: args.title,
      description: args.description,
      time: new Date(args.time),
      order: args.order || -1,
    },
    ctx.clientId,
  );

  return JSON.stringify({
    success: true,
    stackId: stack.id,
    title: stack.title,
  });
}

async function addNewsToEvent(
  args: {
    url: string;
    source: string;
    title: string;
    abstract?: string;
    time: string;
    stackId?: number;
  },
  ctx: ToolContext,
): Promise<string> {
  let newsId: number;
  let created = false;

  await sequelize.transaction(async (transaction) => {
    let news = await News.findOne({
      where: { url: args.url },
      transaction,
    });

    if (news) {
      const existing = await EventStackNews.findOne({
        where: { eventId: ctx.eventId, newsId: news.id },
      });
      if (existing) {
        throw new Error(`News with this URL already exists in the event (newsId: ${news.id})`);
      }
    }

    const time = new Date();
    if (!news) {
      news = await News.create(
        {
          url: args.url,
          source: args.source,
          title: args.title,
          abstract: args.abstract ? args.abstract.slice(0, 200) : undefined,
          time: new Date(args.time),
          status: 'admitted',
        },
        { transaction },
      );
      created = true;

      await RecordService.create(
        {
          model: 'News',
          data: recordData(news, ctx),
          target: news.id,
          action: 'createNews',
          owner: ctx.clientId,
          createdAt: time,
        },
        { transaction },
      );
    }

    newsId = news.id;

    const eventStackNews = await EventStackNews.create(
      {
        eventId: ctx.eventId,
        stackId: args.stackId || undefined,
        newsId: news.id,
      },
      { transaction },
    );

    await RecordService.create(
      {
        model: 'EventStackNews',
        data: recordData(eventStackNews, ctx),
        target: ctx.eventId,
        subtarget: news.id,
        action: 'addNewsToEvent',
        owner: ctx.clientId,
        createdAt: time,
      },
      { transaction },
    );

    if (args.stackId) {
      await RecordService.create(
        {
          model: 'EventStackNews',
          data: recordData(eventStackNews, ctx),
          target: args.stackId,
          subtarget: news.id,
          action: 'addNewsToStack',
          owner: ctx.clientId,
          createdAt: time,
        },
        { transaction },
      );
    }

    // Emit socket events for real-time newsroom updates
    const socket = await EventService.getNewsroomSocket(ctx.eventId);
    const event = await EventService.findEvent(ctx.eventId, { eventOnly: true });
    const client = await Client.findByPk(ctx.clientId);
    socket.emit('add news to event', {
      eventStackNews,
      event,
      news,
      client,
    });

    if (args.stackId) {
      const stack = await Stack.findByPk(args.stackId, { transaction });
      socket.emit('add news to stack', {
        eventStackNews,
        stack,
        news,
        client,
      });
    }
  });

  return JSON.stringify({
    success: true,
    newsId: newsId!,
    created,
    stackId: args.stackId || null,
  });
}

async function addNewsToStack(
  args: { newsId: number; stackId: number },
  ctx: ToolContext,
): Promise<string> {
  await StackService.addNews(args.stackId, args.newsId, ctx.clientId);

  return JSON.stringify({
    success: true,
    newsId: args.newsId,
    stackId: args.stackId,
  });
}

async function updateStack(
  args: { stackId: number; description?: string; title?: string; time?: string },
  ctx: ToolContext,
): Promise<string> {
  const data: any = {};
  if (args.description !== undefined) data.description = args.description;
  if (args.title !== undefined) data.title = args.title;
  if (args.time !== undefined) data.time = new Date(args.time);

  const result = await StackService.updateStack({
    id: args.stackId,
    data,
    clientId: ctx.clientId,
  });

  if (result.status === 201) {
    const socket = await EventService.getNewsroomSocket(ctx.eventId);
    socket.emit('update stack', result.message);
  }

  return JSON.stringify({
    success: true,
    stackId: args.stackId,
    message: result.message.message,
  });
}

async function reorderStacks(
  args: { stackIds: number[] },
  ctx: ToolContext,
): Promise<string> {
  const stacks = args.stackIds.map((stackId, index) => ({
    stackId,
    order: args.stackIds.length - 1 - index, // First in array gets highest order
  }));

  await sequelize.transaction(async (transaction) => {
    const queue = stacks.map(({ stackId, order }) =>
      StackService.updateStack({
        id: stackId,
        data: { order },
        clientId: ctx.clientId,
        transaction,
      }),
    );
    await Promise.all(queue);

    await RecordService.create(
      {
        model: 'Event',
        target: ctx.eventId,
        owner: ctx.clientId,
        action: 'updateStackOrders',
        data: recordData({ stacks }, ctx),
      },
      { transaction },
    );
  });

  const socket = await EventService.getNewsroomSocket(ctx.eventId);
  socket.emit('update stack orders', {
    eventId: ctx.eventId,
    stacks,
  });

  return JSON.stringify({
    success: true,
    newOrder: stacks,
  });
}

async function sendChatMessage(
  args: { text: string },
  ctx: ToolContext,
): Promise<string> {
  await ChatService.sendMessage('newsroom', ctx.clientId, args.text, ctx.eventId);

  return JSON.stringify({ success: true });
}

const QUESTION_POLL_INTERVAL_MS = 2000;
const QUESTION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

async function askUserQuestion(
  args: { question: string; options: string[] },
  ctx: ToolContext,
): Promise<string> {
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
  await ChatService.sendMessage('newsroom', ctx.botClientId, formattedMessage, ctx.eventId);

  // Persist + emit status so the UI shows we're waiting
  const waitingStatus = '等待用户回复...';
  const timestamp = new Date().toISOString();
  try {
    await AgentStatus.create({
      id: randomUUID(),
      runId: ctx.runId,
      eventId: ctx.eventId,
      type: 'status',
      status: waitingStatus,
      authorId: ctx.botClientId,
    } as any);
  } catch (err: any) {
    console.error('[AgentService] Failed to persist agent status:', err.message);
  }
  const socket = await EventService.getNewsroomSocket(ctx.eventId);
  socket.emit('agent status', { eventId: ctx.eventId, status: waitingStatus, runId: ctx.runId, timestamp });

  // Poll the inbox until the user responds or we time out
  const startTime = Date.now();
  while (Date.now() - startTime < QUESTION_TIMEOUT_MS) {
    // Check if agent was stopped
    if (await AgentLock.shouldStop(ctx.eventId)) {
      return JSON.stringify({ error: 'Agent was stopped while waiting for user response.' });
    }

    const inboxMessages = await AgentLock.drainInbox(ctx.eventId);
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
    await new Promise(resolve => setTimeout(resolve, QUESTION_POLL_INTERVAL_MS));

    // Refresh the lock TTL so it doesn't expire while we wait
    await AgentLock.refreshLock(ctx.eventId);
  }

  return JSON.stringify({ error: 'No response received within the time limit.' });
}
