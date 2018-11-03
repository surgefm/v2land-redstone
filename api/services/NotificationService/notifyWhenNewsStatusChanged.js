const { MissingParameterError } = require('../../../utils/errors');
const updateNewsNotifications = require('./updateNewsNotifications');

async function notifyWhenNewsStatusChanged(oldNews, newNews, client) {
  if (!newNews) {
    throw MissingParameterError('newNews');
  }
  client = await ClientService.findClient(client);
  if (!client) {
    throw MissingParameterError('client');
  }
  if (['pending', 'rejected'].includes(oldNews.status) &&
    newNews.status === 'admitted') {
    await sendTelegramNotification(newNews, 'admitted', client);
    await updateNewsNotifications(newNews);
  } else if (oldNews.status === 'admitted' &&
    newNews.status !== 'admitted') {
    await sendTelegramNotification(newNews, 'rejected', client);
  }
}

async function sendTelegramNotification(news, status, handler) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  let event = news.event;
  if (typeof event === 'number') {
    event = await SeqModels.Event.findOne({
      where: { id: event },
      attributes: ['id', 'name'],
    });
  }

  let stack = news.stack;
  if (typeof stack === 'number') {
    stack = await SeqModels.Stack.findOne({
      where: { id: stack },
      attributes: ['id', 'title'],
    });
  }

  const submitRecord = await SeqModels.Record.findOne({
    where: {
      model: 'News',
      action: 'createNews',
      target: news.id,
    },
    include: [{
      model: SeqModels.Client,
      required: true,
    }],
  });

  const username = (submitRecord && submitRecord.client.username)
    ? submitRecord.client.username
    : '游客';

  const content =
    `*${ username }*添加的新闻` +
    `「[${ event.name }](${ sails.config.globals.site }/${ event.id }/${ stack.id }/${ news.id }) 」` +
    `被管理员*${ handler.username }*${ newStatusStringSet[status] }`;
  return TelegramService.sendText(content, 'Markdown');
}

module.exports = notifyWhenNewsStatusChanged;
