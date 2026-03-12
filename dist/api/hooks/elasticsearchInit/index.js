var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = function elasticsearchInit(sails) {
    return {
        initialize: function (cb) {
            return __awaiter(this, void 0, void 0, function* () {
                if (process.env.INIT_ELASTICSEARCH) {
                    const SeqModels = require('../../../models');
                    const { Event, News, Stack, Client } = SeqModels;
                    const events = yield Event.findAll();
                    const news = yield News.findAll();
                    const stacks = yield Stack.findAll();
                    const clients = yield Client.findAll();
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
                        yield Promise.all(promises);
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
                cb();
            });
        },
    };
};

//# sourceMappingURL=index.js.map
