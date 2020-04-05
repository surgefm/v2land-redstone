/**
 * 检查有没有需要发出的汇总推送
 */
import { Report, sequelize } from '@Models';
import { Op } from 'sequelize';
import sendReport from './sendReport';
import pino from 'pino';
const logger = pino();
const checkInterval = 2000;

async function checkReportNotification() {
  try {
    const report = await Report.findOne({
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
    logger.error(err);
    setTimeout(checkReportNotification, checkInterval);
  }
}

export default checkReportNotification;
