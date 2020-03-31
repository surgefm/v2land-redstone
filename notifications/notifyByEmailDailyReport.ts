/**
 * 将通知添加到每日邮件简讯中
 */
import { Notification, Subscription, Report, ReportNotification } from '@Models';
import { ModeService } from '@Services';

async function notifyByEmailDailyReport({ subscription, notification }: {
  notification: Notification,
  subscription: Subscription,
}) {
  const time = await ModeService.getMode('daily').new();

  await global.sequelize.transaction(async transaction => {
    const reportData = {
      time: time.getTime(),
      status: 'pending',
      type: 'daily',
      owner: subscription.subscriber,
    };
    const report = (await Report.findOrCreate({
      where: reportData,
      defaults: reportData,
      transaction,
    }))[0];

    const reportNotificationData = {
      status: 'pending',
      reportId: report.id,
      notificationId: notification.id,
    };
    await ReportNotification.findOrCreate({
      where: reportNotificationData,
      defaults: reportNotificationData,
      transaction,
    });
  });
}

export default notifyByEmailDailyReport;
