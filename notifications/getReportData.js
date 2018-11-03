/**
 * Prepare data for notification reports.
 */
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const SeqModels = require('../seqModels');
const time = require('time');

async function getReportData(report) {
  const notifications = await report.getNotifications({
    through: {
      where: { status: 'pending' },
    },
    inclues: [SeqModels.Event],
    transaction,
  });

  const queue = notifications.map(n => getNotificationData(n));
  await Promise.all(queue);

  notificationGroups = _.groupBy(notifications, 'mode');

  const client = await SeqModels.Client.findById(report.owner);
  const reportCount = await SeqModels.Record.count({
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

async function getNotificationData(notification) {
  if (!notification.eventId) return;
  notification.stack = await SeqModels.Stack.findOne({
    where: {
      eventId: notification.eventId,
      status: 'admitted',
      order: { [Op.gte]: 0 },
    },
    order: [['order', 'DESC']],
    include: {
      model: SeqModels.News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      limit: 1,
      required: false,
    },
  });
  if (notification.stack.news && notification.stack.news.length) {
    notification.news = notification.stack.news[0];
  }
  return notification;
}

function getDate() {
  const date = new time.Date();
  date.setTimezone('Asia/Shanghai');
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const str = `${year}.${month}.${day}`;
  return { year, month, day, str };
}

module.exports = getReportData;
