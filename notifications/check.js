/**
 * 检查有没有需要发出的推送
 */
const SeqModels = require('../seqModels');
const checkInterval = 500;

async function check() {
  try {
    const notification = await SeqModels.Notification.findOne({
      order: sequelize.literal('time DESC'),
      where: { status: 'pending' },
      include: [SeqModels.Event],
    });

    if (!notification) {
      setTimeout(check, checkInterval);
    } else if (!notification.event || !notification.event.name) {
      await notification.upsert({ status: 'inactive' });
      setTimeout(check, checkInterval);
    } else if (notification.time - Date.now() < 0) {
      await notify(notification);
      check();
    } else {
      setTimeout(check, checkInterval);
    }
  } catch (err) {
    sails.log.error(err);
    setTimeout(check, checkInterval);
  }
}

module.exports = check;
