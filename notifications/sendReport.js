const sendEmailReport = require('./sendEmailReport');

async function sendReport(report, { transaction }) {
  switch (report.method) {
  case 'email':
    return sendEmailReport(report, { transaction });
  }
}

module.exports = sendReport;
