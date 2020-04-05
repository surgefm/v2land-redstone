/**
 * 检查有没有需要发出的即时推送
 */
import { Notification, Event } from '@Models';
import { Op } from 'sequelize';
import notify from './notify';
import pino from 'pino';
const logger = pino();
const checkInterval = 1000;

async function checkInstantNotification() {
  try {
    const notification = await Notification.findOne({
      order: [['time', 'DESC']],
      where: {
        status: 'pending',
        time: { [Op.lte]: Date.now() },
      },
      include: [Event],
    });

    if (!notification) {
      setTimeout(checkInstantNotification, checkInterval);
    } else {
      await notify(notification);
      checkInstantNotification();
    }
  } catch (err) {
    logger.error(err);
    setTimeout(checkInstantNotification, checkInterval);
  }
}

module.exports = checkInstantNotification;
