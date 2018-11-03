const notifyWhenEventCreated = require('./NotificationService/notifyWhenEventCreated');
const notifyWhenNewsCreated = require('./NotificationService/notifyWhenNewsCreated');
const notifyWhenEventStatusChanged = require('./NotificationService/notifyWhenEventStatusChanged');
const notifyWhenStackStatusChanged = require('./NotificationService/notifyWhenStackStatusChanged');
const notifyWhenNewsStatusChanged = require('./NotificationService/notifyWhenNewsStatusChanged');
const updateStackNotifications = require('./NotificationService/updateStackNotifications');
const updateNewsNotifications = require('./NotificationService/updateNewsNotifications');

const NotificationService = {

  getNextTime: async (mode, event) => {
    return ModeService[mode].new({ event });
  },

  notified: async (mode, event) => {
    return ModeService[mode].notified({ event });
  },

};

module.exports = {
  notifyWhenEventCreated,
  notifyWhenNewsCreated,
  notifyWhenEventStatusChanged,
  notifyWhenStackStatusChanged,
  notifyWhenNewsStatusChanged,
  updateStackNotifications,
  updateNewsNotifications,
  ...NotificationService,
};
