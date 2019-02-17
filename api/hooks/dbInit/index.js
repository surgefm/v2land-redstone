module.exports = function DBInit(sails) {
  return {
    initialize: function(cb) {
      const SeqModels = require('../../../seqModels');
      const { Event } = SeqModels;
      Event.findAll({
        where: {
          latestAdmittedNewsId: null,
        },
      }).then(events => {
        const promises = [];
        events.forEach(event => {
          promises.push(EventService.updateAdmittedLatestNews(event.id, {}));
        });
        return Promise.all(promises);
      }).then(() => cb());
    },
  };
};
