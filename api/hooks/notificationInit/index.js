const checkInstantNotification = require('../../../notifications/checkInstantNotification');
const checkReportNotification = require('../../../notifications/checkReportNotification');

module.exports = function NotificationInit(sails) {
  return {
    initialize: function(cb) {
      sails.on('hook:orm:loaded', () => {
        if (sails.config.globals.notification) {
          setTimeout(checkInstantNotification, 500);
          setTimeout(checkReportNotification, 500);
        }

        cb();
      });
    },
  };
};
