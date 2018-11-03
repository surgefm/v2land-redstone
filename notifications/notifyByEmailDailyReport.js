/**
 * 将通知添加到每日邮件简讯中
 */
const SeqModels = require('../seqModels');

async function notifyByEmailDailyReport({ subscription, template, notification }) {
  const time = ModeService.daily.new();

  await sequelize.transaction(async transaction => {
    const reportData = {
      time,
      status: 'pending',
      type: 'daily',
      owner: subscription.subscriber,
    };
    const report = await SeqModels.Report.findOrCreate({
      where: reportData,
      defaults: reportData,
      transaction,
    })[0];

    const reportNotificationData = {
      status: 'pending',
      reportId: report.id,
      notificationId: notification.id,
    };
    await SeqModels.ReportNotification.findOrCreate({
      where: reportNotificationData,
      defaults: reportNotificationData,
      transaction,
    });
  });
}

module.exports = notifyByEmailDailyReport;
