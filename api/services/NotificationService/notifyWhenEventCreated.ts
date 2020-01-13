import { globals } from '@Configs';
import { EventObj } from '@Types';
import { Client } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';
import * as UtilService from '../UtilService';

async function notifyWhenEventCreated(event: EventObj, handler: number | string | Client) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  const sendSlackMessage = async () => {
    let content = `*${username}* 提交了事件 *${event.name}* ` +
    `，请管理员尽快<${globals.site}/admin/event|审核>`;

    if (isAdmin && event.status === 'admitted') {
      content = `管理员 *${username}* 提交了事件` +
      ` <${globals.site}/${event.id}|${event.name}> ` +
      `，进来看看吧！`;
    }

    return SlackService.sendText(content);
  };

  const sendTelegramMessage = async () => {
    let content = `*${username}*提交了事件*「${event.name}*」` +
    `，请管理员尽快[审核](${globals.site}/admin/event)`;

    if (isAdmin && event.status === 'admitted') {
      content = `管理员*${username}*提交了事件` +
      `「[${event.name}](${globals.site}/${event.id})」` +
      `，进来看看吧！`;
    }

    return TelegramService.sendText(content, 'Markdown', true);
  };

  return Promise.all([
    sendSlackMessage(),
    sendTelegramMessage(),
  ]);
}

export default notifyWhenEventCreated;
