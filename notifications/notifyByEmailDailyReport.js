/**
 * 将通知添加到每日邮件简讯中
 */
const SeqModels = require('../seqModels');

async function notifyByEmailDailyReport({ subscription, template, notification }) {
  const time = ModeService.daily.new();

  await sequelize.transaction(async transaction => {
    const report = await SeqModels.Report.findOrCreate({
      where: {
        time,
        status: 'pending',
        type: 'daily',
        owner: subscription.subscriber,
      },
      transaction,
    })[0];

    await SeqModels.ReportNotification.findOrCreate({
      where: {
        status: 'pending',
        reportId: report.id,
        notificationId: notification.id,
      },
      transaction,
    });
  });
}

module.exports = notifyByEmailDailyReport;
