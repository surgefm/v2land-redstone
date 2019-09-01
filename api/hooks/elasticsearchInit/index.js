module.exports = function elasticsearchInit(sails) {
  return {
    initialize: async function(cb) {
      if (process.env.INIT_ELASTICSEARCH) {
        const SeqModels = require('../../../seqModels');
        const { Event, News, Stack, Client } = SeqModels;
        const events = await Event.findAll();
        const news = await News.findAll();
        const stacks = await Stack.findAll();
        const clients = await Client.findAll();

        const promises = [];
        events.forEach(event => {
          promises.push(EventService.updateElasticsearchIndex({ event }));
        });
        news.forEach(n => {
          promises.push(NewsService.updateElasticsearchIndex({ news: n }));
        });
        stacks.forEach(stack => {
          promises.push(StackService.updateElasticsearchIndex({ stack }));
        });
        clients.forEach(client => {
          promises.push(ClientService.updateElasticsearchIndex({ client }));
        });
        try {
          await Promise.all(promises);
        } catch (err) {
          console.error(err);
        }
      }
      cb();
    },
  };
};
