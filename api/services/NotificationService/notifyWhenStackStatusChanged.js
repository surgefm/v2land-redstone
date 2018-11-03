const { MissingParameterError } = require('../../../utils/errors');
const updateStackNotifications = require('./updateStackNotifications');

async function notifyWhenStackStatusChanged(oldStack, newStack, client) {
  if (!newStack) {
    throw MissingParameterError('newStack');
  }
  client = await ClientService.findClient(client);
  if (!client) {
    throw MissingParameterError('client');
  }
  if (['pending', 'rejected'].includes(oldStack.status) &&
    newStack.status === 'admitted' &&
    newStack.order >= 0) {
    await sendTelegramNotification(newStack, 'admitted', client);
    await updateStackNotifications(newStack);
  } else if (oldStack.status === 'admitted' &&
    newStack.status !== 'admitted') {
    await sendTelegramNotification(newStack, 'rejected', client);
  }
}

async function sendTelegramNotification(stack, status, handler) {
  const newStatusStringSet = {
    'admitted': '审核通过了，进来看看吧！',
    'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
    'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
    'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
  };

  let event = stack.event;
  if (typeof event === 'number') {
    event = await SeqModels.Event.findOne({
      where: { id: event },
      attributes: ['id', 'title'],
    });
  }

  const submitRecord = await SeqModels.Record.findOne({
    where: {
      model: 'Stack',
      action: 'createStack',
      target: stack.id,
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
    `*${ username }*创建的进展` +
    `「[${ event.name }](${ sails.config.globals.site }/${ event.id }/${ stack.id }) 」` +
    `被管理员*${ handler.username }*${ newStatusStringSet[status] }`;
  return TelegramService.sendText(content, 'Markdown');
}

module.exports = notifyWhenStackStatusChanged;
