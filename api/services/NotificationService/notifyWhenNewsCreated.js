async function notifyWhenNewsCreated(news, handler) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  const eventId = news.eventId;
  const stackId = news.stackId;

  let content = `*${username}* 提交了新闻 *${news.title}* ` +
  `，请管理员尽快<${sails.config.globals.site}/${eventId}/admit|审核>`;

  if (isAdmin && news.status === 'admitted') {
    content = `管理员 *${username}* 提交了新闻` +
    ` <${sails.config.globals.site}/${eventId}/${stackId}/${news.id})|${event.name}> ` +
    `，进来看看吧！`;
  }

  return SlackService.sendText(content, 'Markdown', true);
}

module.exports = notifyWhenNewsCreated;
