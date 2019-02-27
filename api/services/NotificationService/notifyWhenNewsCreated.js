async function notifyWhenNewsCreated(news, handler) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  const eventId = news.eventId;
  const stackId = news.stackId;

  const sendSlack = async () => {
    let content = `*${username}* 提交了新闻 *${news.title}* ` +
    `，请管理员尽快<${sails.config.globals.site}/${eventId}/admit|审核>`;

    if (isAdmin && news.status === 'admitted') {
      content = `管理员 *${username}* 提交了新闻` +
      ` <${sails.config.globals.site}/${eventId}/${stackId}/${news.id})|${event.name}> ` +
      `，进来看看吧！`;
    }

    return SlackService.sendText(content, 'Markdown', true);
  };

  const sendTelegram = async () => {
    let content = `*${username}*提交了新闻*「${news.title}*」` +
      `，请管理员尽快[审核](${sails.config.globals.site}/${eventId}/admit)`;


    if (isAdmin && news.status === 'admitted') {
      content = `管理员*${username}*提交了新闻` +
      `「[${event.name}](${sails.config.globals.site}/${eventId}/${stackId}/${news.id})」` +
      `，进来看看吧！`;
    }


    return TelegramService.sendText(content, 'Markdown', true);
  };

  return Promise.all([
    sendSlack(),
    sendTelegram(),
  ]);
}

module.exports = notifyWhenNewsCreated;
