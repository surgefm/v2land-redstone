/**
 * 检查有没有需要发出的即时推送
 */
const SeqModels = require('../models');
const { Op } = require('sequelize');
const notify = require('./notify');
const checkInterval = 1000;

async function checkInstantNotification() {
  try {
    const notification = await SeqModels.Notification.findOne({
      order: [['time', 'DESC']],
      where: {
        status: 'pending',
        time: { [Op.lte]: Date.now() },
      },
      include: [SeqModels.Event],
    });

    if (!notification) {
      setTimeout(checkInstantNotification, checkInterval);
    } else {
      await notify(notification);
      checkInstantNotification();
    }
  } catch (err) {
    sails.log.error(err);
    setTimeout(checkInstantNotification, checkInterval);
  }
}

module.exports = checkInstantNotification;
