import { globals } from '@Configs';
import { News, Client } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';
import * as UtilService from '../UtilService';
import * as EventService from '../EventService';

async function notifyWhenNewsCreated(news: News, handler: number | string | Client) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  const eventId = news.eventId;
  const stackId = news.stackId;

  const event = await EventService.findEvent(eventId, { eventOnly: true });

  const sendSlack = async () => {
    let content = `*${username}* 提交了新闻 *${news.title}* ` +
    `，请管理员尽快<${globals.site}/${eventId}/admit|审核>`;

    if (isAdmin && news.status === 'admitted') {
      content = `管理员 *${username}* 提交了新闻` +
      ` <${globals.site}/${eventId}/${stackId}/${news.id})|${event.name}> ` +
      `，进来看看吧！`;
    }

    return SlackService.sendText(content);
  };

  const sendTelegram = async () => {
    let content = `*${username}*提交了新闻*「${news.title}*」` +
      `，请管理员尽快[审核](${globals.site}/${eventId}/admit)`;


    if (isAdmin && news.status === 'admitted') {
      content = `管理员*${username}*提交了新闻` +
      `「[${event.name}](${globals.site}/${eventId}/${stackId}/${news.id})」` +
      `，进来看看吧！`;
    }


    return TelegramService.sendText(content, 'Markdown', true);
  };

  return Promise.all([
    sendSlack(),
    sendTelegram(),
  ]);
}

export default notifyWhenNewsCreated;
