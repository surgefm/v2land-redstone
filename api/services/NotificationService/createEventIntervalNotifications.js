const SeqModels = require('../../../seqModels');
const { MissingParameterError } = require('../../../utils/errors');

async function createEventIntervalNotifications(event, { transaction } = {}) {
  if (typeof event === 'undefined' || !event.id) {
    throw new MissingParameterError('event');
  }

  const notificationCount = SeqModels.Notification.count({
    where: { event: event.id },
  });
  if (notificationCount > 0) return;

  if (transaction) {
    return initializeNotifications(event, { transaction });
  } else {
    return sequelize.transaction(async transaction => {
      return initializeNotifications(event, { transaction });
    });
  }
}

async function initializeNotifications(event, { transaction }) {
  const promises = [];
  Object.keys(ModeService).map(key => {
    if (ModeService[key].isInterval) {
      promises.push(async () => {
        await SeqModels.Notification.create({
          time: ModeService[key].new(),
          mode: key,
          status: 'pending',
          event: event.id,
        }, { transaction });
      });
    }
  });
  return Promise.all(promises);
}

module.exports = createEventIntervalNotifications;
