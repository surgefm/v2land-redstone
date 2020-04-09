/**
 * Prepare data for notification reports.
 */
import { Event, Report, Client, Stack, News, Record, Notification } from '@Models';
import { ModeService } from '@Services';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';
import moment from 'moment-timezone';

async function getReportData(report: Report, { transaction }: { transaction: Transaction }) {
  const notifications = await report.$get('notifications', {
    where: { status: 'pending' },
    include: [Event],
    transaction,
  });

  const queue = notifications.map(n => getNotificationData(n));
  await Promise.all(queue);

  const notificationGroups = _.groupBy(notifications, 'mode');

  const client = await Client.findByPk(report.owner);
  const reportCount = await Record.count({
    where: {
      action: ModeService.getRecordActionName(report),
      owner: report.owner,
    },
  });
  return {
    notifications,
    notificationGroups,
    date: getDate(),
    modeNames: ModeService.names,
    reportCount: reportCount + 1,
    client,
  };
}

async function getNotificationData(notification: Notification) {
  if (!notification.eventId) return;
  notification.stack = await Stack.findOne({
    where: {
      eventId: notification.eventId,
      status: 'admitted',
      order: { [Op.gte]: 0 },
    },
    order: [['order', 'DESC']],
    include: [{
      model: News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      required: false,
    }],
  });
  if (notification.stack && notification.stack.news) {
    notification.news = notification.stack.news[0];
  }
  return notification;
}

function getDate() {
  const date = moment(new Date).tz('Asia/Shanghai');

  const year = date.year();
  const month = date.month();
  const day = date.date();
  const str = `${year}.${month}.${day}`;
  return { year, month, day, str };
}

export default getReportData;
