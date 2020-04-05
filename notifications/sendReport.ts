import { Report } from '@Models';
import { Transaction } from 'sequelize';
import sendEmailReport from './sendEmailReport';

async function sendReport(report: Report, { transaction }: { transaction: Transaction }) {
  switch (report.method) {
  case 'email':
    return sendEmailReport(report, { transaction });
  }
}

export default sendReport;
