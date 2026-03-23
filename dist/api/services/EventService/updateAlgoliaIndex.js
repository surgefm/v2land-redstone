"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const ClientService_1 = require("../ClientService");
const AlgoliaService_1 = require("../AlgoliaService");
function updateAlgoliaIndex({ event, eventId, transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        event = yield _Models_1.Event.findOne({
            where: { id: event ? event.id : eventId },
            include: [{
                    model: _Models_1.HeaderImage,
                    as: 'headerImage',
                    required: false,
                }, {
                    model: _Models_1.Client,
                    as: 'owner',
                    required: true,
                }],
            transaction,
        });
        if (event.status !== 'admitted') {
            return (0, AlgoliaService_1.deleteEvent)(event.id);
        }
        if (event.get)
            event = event.get({ plain: true });
        event.owner = (0, ClientService_1.sanitizeClient)(event.owner);
        return (0, AlgoliaService_1.updateEvent)(event);
    });
}
exports.default = updateAlgoliaIndex;

//# sourceMappingURL=updateAlgoliaIndex.js.map
