/**
 * 检查有没有需要发出的汇总推送
 */
const SeqModels = require('../models');
const { Op } = require('sequelize');
const sendReport = require('./sendReport');
const checkInterval = 2000;

async function checkReportNotification() {
  try {
    const report = await SeqModels.Report.findOne({
      order: [['time', 'ASC']],
      where: {
        status: 'pending',
        time: { [Op.lte]: Date.now() },
      },
    });

    if (!report) {
      setTimeout(checkReportNotification, checkInterval);
    } else {
      await sequelize.transaction(async transaction => {
        await report.update(
          { status: 'ongoing' },
          { transaction });
        await sendReport(report, { transaction });
      });
      checkReportNotification();
    }
  } catch (err) {
    sails.log.error(err);
    setTimeout(checkReportNotification, checkInterval);
  }
}

module.exports = checkReportNotification;
