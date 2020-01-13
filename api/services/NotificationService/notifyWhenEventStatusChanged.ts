import { MissingParameterError } from '@Utils/errors';
import { globals } from '@Configs';
import { EventObj } from '@Types';
import { Client, Record } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';

async function notifyWhenEventStatusChanged(
  oldEvent: EventObj,
  newEvent: EventObj,
  clientId: number | string | Client,
) {
  if (!oldEvent) {
    throw new MissingParameterError('oldEvent');
  }
  if (!newEvent) {
    throw new MissingParameterError('newEvent');
  }

  const client = await ClientService.findClient(clientId);

  if ((oldEvent.status === 'pending' || oldEvent.status === 'rejected') &&
    newEvent.status === 'admitted') {
    await sendNotification(newEvent, 'admitted', client);
  } else if (oldEvent.status !== 'rejected' && newEvent.status === 'rejected') {
    await sendNotification(newEvent, 'rejected', client);
  } else if (oldEvent.status === 'hidden' && newEvent.status === 'admitted') {
    await sendNotification(newEvent, 'admittedFromHidden', client);
  }
}

async function sendNotification(event: EventObj, status: string, handler: Client) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'admittedFromHidden': '转为公开状态，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  const submitRecord = await Record.findOne({
    where: {
      model: 'Event',
      action: 'createEvent',
      target: event.id,
    },
    include: [{
      model: Client,
      required: true,
    }],
  });

  const username = (submitRecord && submitRecord.ownedBy.username)
    ? submitRecord.ownedBy.username
    : '游客';

  const sendTelegram = async () => {
    const content =
      `*${ username }*提交的事件` +
      `「[${ event.name }](${ globals.site }/${ event.id }) 」` +
      `被管理员*${ handler.username }*${ (newStatusStringSet as any)[status] }`;
    return TelegramService.sendText(content, 'Markdown');
  };

  const sendSlack = async () => {
    const content =
      `*${ username }* 提交的事件` +
      ` <${ globals.site }/${ event.id }|${ event.name }>  ` +
      `被管理员 *${ handler.username }* ${ (newStatusStringSet as any)[status] }`;
    return SlackService.sendText(content);
  };

  return Promise.all([
    sendTelegram(),
    sendSlack(),
  ]);
}

export default notifyWhenEventStatusChanged;
