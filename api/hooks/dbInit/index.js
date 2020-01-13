module.exports = function DBInit(sails) {
  return {
    initialize: async function(cb) {
      const SeqModels = require('../../../models');
      const { Event } = SeqModels;
      const events = await Event.findAll({
        where: {
          latestAdmittedNewsId: null,
        },
      });

      const promises = [];
      events.forEach(event => {
        promises.push(EventService.updateAdmittedLatestNews(event.id, {}));
      });

      await Promise.all(promises);
      cb();
    },
  };
};
