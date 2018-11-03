async function notifyWhenNewsCreated(news, handler) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  let eventId = news.event;
  if (typeof eventId === 'object') {
    eventId = news.event.id;
  }

  let stackId = news.stack;
  if (typeof stackId === 'object') {
    stackId = news.stack.id;
  }

  let content = `*${username}*提交了新闻*「${news.title}*」` +
  `，请管理员尽快[审核](${sails.config.globals.site}/${eventId}/admit)`;

  if (isAdmin && news.status === 'admitted') {
    content = `管理员*${username}*提交了新闻` +
    `「[${event.name}](${sails.config.globals.site}/${eventId}/${stackId}/${news.id})」` +
    `，进来看看吧！`;
  }

  return TelegramService.sendText(content, 'Markdown', true);
}

module.exports = notifyWhenNewsCreated;
