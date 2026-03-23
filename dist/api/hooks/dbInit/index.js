var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = function DBInit(sails) {
    return {
        initialize: function (cb) {
            return __awaiter(this, void 0, void 0, function* () {
                const SeqModels = require('../../../models');
                const { Event } = SeqModels;
                const events = yield Event.findAll({
                    where: {
                        latestAdmittedNewsId: null,
                    },
                });
                const promises = [];
                events.forEach(event => {
                    promises.push(EventService.updateAdmittedLatestNews(event.id, {}));
                });
                yield Promise.all(promises);
                cb();
            });
        },
    };
};

//# sourceMappingURL=index.js.map
