async function notifyWhenEventCreated(event, handler) {
  const client = await ClientService.findClient(handler);
  const username = (client && client.username) || '游客';
  const isAdmin = await UtilService.isAdmin(client);

  const sendSlackMessage = async () => {
    let content = `*${username}* 提交了事件 *${event.name}* ` +
    `，请管理员尽快<${sails.config.globals.site}/admin/event|审核>`;

    if (isAdmin && event.status === 'admitted') {
      content = `管理员 *${username}* 提交了事件` +
      ` <${sails.config.globals.site}/${event.id}|${event.name}> ` +
      `，进来看看吧！`;
    }

    return SlackService.sendText(content);
  };

  const sendTelegramMessage = async () => {
    let content = `*${username}*提交了事件*「${event.name}*」` +
    `，请管理员尽快[审核](${sails.config.globals.site}/admin/event)`;


   if (isAdmin && event.status === 'admitted') {
    content = `管理员*${username}*提交了事件` +
    `「[${event.name}](${sails.config.globals.site}/${event.id})」` +
    `，进来看看吧！`;
    }


   return TelegramService.sendText(content, 'Markdown', true);
  }

  return Promise.all([
    sendSlackMessage(),
    sendTelegramMessage(),
  ])
}

module.exports = notifyWhenEventCreated;
