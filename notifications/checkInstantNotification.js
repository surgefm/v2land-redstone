/**
 * 检查有没有需要发出的即时推送
 */
const SeqModels = require('../seqModels');
const notify = require('./notify');
const checkInterval = 500;

async function checkInstantNotification() {
  try {
    const notification = await SeqModels.Notification.findOne({
      order: [['time', 'DESC']],
      where: { status: 'pending' },
      include: [SeqModels.Event],
    });

    if (!notification) {
      setTimeout(checkInstantNotification, checkInterval);
    } else if (notification.time - Date.now() < 0) {
      await notify(notification);
      check();
    } else {
      setTimeout(checkInstantNotification, checkInterval);
    }
  } catch (err) {
    sails.log.error(err);
    setTimeout(checkInstantNotification, checkInterval);
  }
}

module.exports = checkInstantNotification;
