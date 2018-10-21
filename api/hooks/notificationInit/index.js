const checkNotification = require('../../../notifications/check');

module.exports = function NotificationInit(sails) {
  return {
    initialize: function(cb) {
      sails.on('hook:orm:loaded', () => {
        if (sails.config.globals.notification) {
          setTimeout(checkNotification, checkInterval);
        }

        cb();
      });
    },
  };
};
