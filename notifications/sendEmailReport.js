/**
 * 正式发送邮件简讯（每日简讯/周报悉可）
 */
const getReportData = require('./getReportData');
const SeqModels = require('../seqModels');

async function sendEmailReport(report, { transaction }) {
  const reportData = await getReportData(report);

  const titles = {
    daily: '日报',
    weekly: '周报',
    monthly: '月报',
  };

  const email = {
    from: {
      name: '浪潮 V2Land',
      address: 'notify@langchao.org',
    },
    to: reportData.client.email,
    subject: `你的浪潮${titles[report.type] || '汇报'} - ${reportData.date.str}`,
    template: `email-report-${report.type}`,
    context: reportData,
  };

  await EmailService.send(email);

  await report.update({ status: 'complete' }, { transaction });
  await SeqModels.ReportNotification.update(
    { status: 'complete' },
    {
      where: {
        reportId: report.id,
        status: 'pending',
      },
      transaction,
    },
  );

  return RecordService.create({
    model: 'Report',
    action: ModeService.getRecordActionName(report),
    owner: report.owner,
    target: report.id,
  }, { transaction });
}

module.exports = sendEmailReport;
