const SeqModels = require('../../../seqModels');

async function updateStackNotifications(stack, { transaction, force = false } = {}) {
  const latestStack = await SeqModels.Stack.findOne({
    where: {
      eventId: stack.eventId,
      status: 'admitted',
      order: 1,
    },
    sort: [['order', 'DESC']],
    attributes: ['id'],
    transaction,
  });

  if (!force && (!latestStack || (+latestStack.id !== +stack.id))) return;

  const recordCount = await SeqModels.Record.count({
    model: 'Stack',
    target: stack.id,
    action: 'notifyNewStack',
    transaction,
  });

  if (!force && recordCount) return;

  let event = stack.event;
  if (typeof event !== 'object') {
    event = await SeqModels.Event.findById(stack.eventId, { transaction });
  }

  if (!transaction) {
    await sequelize.transaction(async transaction => {
      return updateNotifications(event, stack, transaction);
    });
  } else {
    return updateNotifications(event, stack, transaction);
  }
}

async function updateNotifications(event, stack, transaction) {
  const modes = ['EveryNewStack', '30DaysSinceLatestStack'];

  for (const mode of modes) {
    if (ModeService[mode].keepLatestOnly) {
      await SeqModels.Notification.update({
        status: 'discarded',
      }, {
        where: {
          eventId: event.id,
          mode,
        },
        transaction,
      });
    }
    await SeqModels.Notification.create({
      time: await ModeService[mode].new({ event, stack, transaction }),
      status: 'pending',
      eventId: event.id,
      mode,
    }, { transaction });
  }

  await SeqModels.Record.create({
    model: 'Stack',
    target: stack.id,
    operation: 'create',
    action: 'notifyNewStack',
  }, { transaction });
}

module.exports = updateStackNotifications;
