const { MissingParameterError } = require('../../../utils/errors');

async function notifyWhenEventStatusChanged(oldEvent, newEvent, client) {
  if (!oldEvent) {
    throw new MissingParameterError('oldEvent');
  }
  if (!newEvent) {
    throw new MissingParameterError('newEvent');
  }

  client = await ClientService.findClient(client);

  if ((oldEvent.status === 'pending' || oldEvent.status === 'rejected') &&
    newEvent.status === 'admitted') {
    await sendNotification(newEvent, 'admitted', client);
  } else if (oldEvent.status !== 'rejected' && newEvent.status === 'rejected') {
    await sendNotification(newEvent, 'rejected', client);
  } else if (oldEvent.status === 'hidden' && newEvent.status === 'admitted') {
    await sendNotification(newEvent, 'admittedFromHidden', client);
  }
}

async function sendNotification(event, status, handler) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'admittedFromHidden': '转为公开状态，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  const submitRecord = await SeqModels.Record.findOne({
    where: {
      model: 'Event',
      action: 'createEvent',
      target: event.id,
    },
    include: [{
      model: SeqModels.Client,
      required: true,
    }],
  });

  const username = (submitRecord && submitRecord.client.username)
    ? submitRecord.client.username
    : '游客';

  const sendTelegram = async () => {
    const content =
      `*${ username }*提交的事件` +
      `「[${ event.name }](${ sails.config.globals.site }/${ event.id }) 」` +
      `被管理员*${ handler.username }*${ newStatusStringSet[status] }`;
    return TelegramService.sendText(content, 'Markdown');
  }

  const sendSlack = async () => {
    const content =
      `*${ username }* 提交的事件` +
      ` <${ sails.config.globals.site }/${ event.id }|${ event.name }>  ` +
      `被管理员 *${ handler.username }* ${ newStatusStringSet[status] }`;
    return SlackService.sendText(content);
  }

  return Promise.all([
    sendTelegram(),
    sendSlack(),
  ]);
}

module.exports = notifyWhenEventStatusChanged;
