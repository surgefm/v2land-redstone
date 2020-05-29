import { globals } from '@Configs';
import { News, Client, Event, Stack } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';
import * as AccessControlService from '../AccessControlService';

async function notifyWhenNewsCreated(news: News, handler: number | string | Client) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await AccessControlService.isClientAdmin(client.id);

  const stacks = news.stacks || await news.$get('stacks');
  const promises = [];
  for (const stack of stacks) {
    const event = await Event.findByPk(stack.eventId);
    promises.push(sendSlack(event, stack, news, username, isAdmin));
    promises.push(sendTelegram(event, stack, news, username, isAdmin));
  }

  return Promise.all(promises);
}

async function sendSlack(event: Event, stack: Stack, news: News, username: string, isAdmin: boolean) {
  let content = `*${username}* 提交了新闻 *${news.title}* ` +
  `，请管理员尽快<${globals.site}/${event.id}/admit|审核>`;

  if (isAdmin && news.status === 'admitted') {
    content = `管理员 *${username}* 提交了新闻` +
    ` <${globals.site}/${event.id}/${stack.id}/${news.id})|${event.name}> ` +
    `，进来看看吧！`;
  }

  return SlackService.sendText(content);
}

async function sendTelegram(event: Event, stack: Stack, news: News, username: string, isAdmin: boolean) {
  let content = `*${username}*提交了新闻*「${news.title}*」` +
    `，请管理员尽快[审核](${globals.site}/${event.id}/admit)`;


  if (isAdmin && news.status === 'admitted') {
    content = `管理员*${username}*提交了新闻` +
    `「[${event.name}](${globals.site}/${event.id}/${stack.id}/${news.id})」` +
    `，进来看看吧！`;
  }

  return TelegramService.sendText(content, 'Markdown', true);
}

export default notifyWhenNewsCreated;
