import { MissingParameterError } from '@Utils/errors';
import { globals } from '@Configs';
import { Client, News, Event, Record } from '@Models';
import * as TelegramService from '../TelegramService';
import * as SlackService from '../SlackService';
import * as ClientService from '../ClientService';

async function notifyWhenNewsStatusChanged(
  oldNews: News,
  newNews: News,
  client: number | string | Client,
) {
  if (!newNews) {
    throw new MissingParameterError('newNews');
  }
  client = await ClientService.findClient(client, { forceUpdate: false });
  if (!client) {
    throw new MissingParameterError('client');
  }
  if (['pending', 'rejected'].includes(oldNews.status) &&
    newNews.status === 'admitted') {
    await sendTelegramNotification(newNews, 'admitted', client);
  } else if (oldNews.status === 'admitted' &&
    newNews.status !== 'admitted') {
    await sendTelegramNotification(newNews, 'rejected', client);
  }
}

async function sendTelegramNotification(
  news: News,
  status: string,
  handler: Client,
) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  let stacks = news.stacks;
  if (!stacks) {
    stacks = await news.$get('stacks', {
      attributes: ['id', 'title'],
    });
  }

  for (const stack of stacks) {
    const event = await Event.findByPk(stack.eventId, { attributes: ['id', 'name'] });

    const submitRecord = await Record.findOne({
      where: {
        model: 'News',
        action: 'createNews',
        target: news.id,
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
        `*${ username }* 添加的新闻` +
        ` <${ globals.site }/${ event.id }/${ stack.id }/${ news.id }|${ event.name }> ` +
        `被管理员 *${ handler.username }* ${ (newStatusStringSet as any)[status] }`;
      return SlackService.sendText(content);
    };

    const sendTelegram = async () => {
      const content =
        `*${ username }*添加的新闻` +
        `「[${ event.name }](${ globals.site }/${ event.id }/${ stack.id }/${ news.id }) 」` +
        `被管理员*${ handler.username }*${ (newStatusStringSet as any)[status] }`;
      return TelegramService.sendText(content, 'Markdown');
    };

    await Promise.all([
      sendSlack(),
      sendTelegram(),
    ]);
  }
}

export default notifyWhenNewsStatusChanged;
