"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const StarService = __importStar(require("@Services/StarService"));
function getEventsClientContributedTo(clientId, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const events = yield _Models_1.sequelize.query(`
    SELECT *
    FROM event
    WHERE
        event.status = 'admitted' AND
      ("ownerId" = ${clientId} OR
      (event.id in (
        SELECT DISTINCT ON ("eventId") "eventId"
        FROM public."eventContributor"
        WHERE "contributorId" = ${clientId}
        ORDER BY "eventId", "createdAt" DESC
      )))
    ORDER BY event."updatedAt" DESC
  `, {
            transaction,
            type: _Models_1.Sequelize.QueryTypes.SELECT,
        });
        yield Promise.all(events.map((e) => __awaiter(this, void 0, void 0, function* () {
            e.headerImage = yield _Models_1.HeaderImage.findOne({ where: { eventId: e.id }, transaction });
            const eventTags = yield _Models_1.EventTag.findAll({ where: { eventId: e.id } });
            e.tags = yield Promise.all(eventTags.map((t) => __awaiter(this, void 0, void 0, function* () { return _Models_1.Tag.findByPk(t.tagId); })));
            e.tags = e.tags.filter(t => t.status === 'visible');
            e.starCount = yield StarService.countStars(e.id);
        })));
        return events;
    });
}
exports.default = getEventsClientContributedTo;

//# sourceMappingURL=getEventsClientContributedTo.js.map
