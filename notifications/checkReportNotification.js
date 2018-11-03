/**
 * 检查有没有需要发出的汇总推送
 */
const SeqModels = require('../seqModels');
const sendReport = require('./sendReport');
const checkInterval = 2000;

async function checkReportNotification() {
  try {
    const report = await SeqModels.Report.findOne({
      order: [['time', 'ASC']],
      where: { status: 'pending' },
    });

    if (!report) {
      setTimeout(checkReportNotification, checkInterval);
    } else if (report.time - Date.now() < 0) {
      await sequelize.transaction(async transaction => {
        await report.update(
          { status: 'ongoing' },
          { transaction });
        await sendReport(report, { transaction });
      });
      checkReportNotification();
    } else {
      setTimeout(checkReportNotification, checkInterval);
    }
  } catch (err) {
    sails.log.error(err);
    setTimeout(checkReportNotification, checkInterval);
  }
}

module.exports = checkReportNotification;
