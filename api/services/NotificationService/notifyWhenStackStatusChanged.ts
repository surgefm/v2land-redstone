import { MissingParameterError } from '@Utils/errors';
import { globals } from '@Configs';
import { StackObj } from '@Types';
import { Client, Record, Stack, Event } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';

async function notifyWhenStackStatusChanged(
  oldStack: StackObj,
  newStack: Stack,
  client: number | string | Client,
) {
  if (!oldStack) {
    throw new MissingParameterError('newStack');
  }
  if (!newStack) {
    throw new MissingParameterError('newStack');
  }
  client = await ClientService.findClient(client);
  if (!client) {
    throw new MissingParameterError('client');
  }
  if (['pending', 'rejected'].includes(oldStack.status) &&
    newStack.status === 'admitted' &&
    newStack.order >= 0) {
    await sendTelegramNotification(newStack, 'admitted', client);
  } else if (oldStack.status === 'admitted' &&
    newStack.status !== 'admitted') {
    await sendTelegramNotification(newStack, 'rejected', client);
  }
}

async function sendTelegramNotification(stack: Stack, status: string, handler: Client) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  let event = stack.event;
  if (!event) {
    event = await Event.findOne({
      where: { id: stack.eventId },
      attributes: ['id', 'title'],
    });
  }

  const submitRecord = await Record.findOne({
    where: {
      model: 'Stack',
      action: 'createStack',
      target: stack.id,
    },
    include: [{
      model: Client,
      required: true,
    }],
  });

  const username = (submitRecord && submitRecord.ownedBy.username)
    ? submitRecord.ownedBy.username
    : '游客';

  const sendSlack = async () => {
    const content =
      `*${ username }* 创建的进展` +
      ` <${ globals.site }/${ event.id }/${ stack.id }|${ event.name }> ` +
      `被管理员 *${ handler.username }* ${ (newStatusStringSet as any)[status] }`;
    return SlackService.sendText(content);
  };

  const sendTelegram = async () => {
    const content =
      `*${ username }*创建的进展` +
      `「[${ event.name }](${ globals.site }/${ event.id }/${ stack.id }) 」` +
      `被管理员*${ handler.username }*${ (newStatusStringSet as any)[status] }`;
    return TelegramService.sendText(content, 'Markdown');
  };

  return Promise.all([
    sendSlack(),
    sendTelegram(),
  ]);
}

export default notifyWhenStackStatusChanged;
