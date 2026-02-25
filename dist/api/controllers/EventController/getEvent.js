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
const _Services_1 = require("@Services");
function getEvent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventId = yield _Services_1.EventService.getEventId(req.params);
        if (!eventId) {
            return res.status(404).json({
                message: '未找到该事件',
            });
        }
        const e = yield _Models_1.Event.findByPk(eventId);
        const showLatest = req.query.latest === '1';
        const noAccess = (event) => {
            res.status(401).json({
                message: '你无权查看事件最新编辑情况',
                event,
            });
        };
        const roles = yield _Services_1.AccessControlService.getEventClients(eventId);
        const starCount = yield _Services_1.StarService.countStars(eventId);
        const subscriptionCount = yield _Services_1.RedisService.hlen(_Services_1.RedisService.getSubscriptionCacheKey(eventId));
        const curations = yield _Services_1.EventService.getCurations(eventId);
        let deniedAccess = false;
        if (showLatest) {
            if (!req.session.clientId)
                deniedAccess = true;
            else {
                const haveAccess = e.status === 'admitted' ||
                    (yield _Services_1.AccessControlService.isAllowedToViewEvent(req.session.clientId, eventId));
                if (!haveAccess)
                    deniedAccess = true;
            }
        }
        const commit = yield _Services_1.CommitService.getLatestCommit(eventId);
        const commitData = commit ? Object.assign(Object.assign({}, commit.data), { roles,
            starCount,
            subscriptionCount, needContributor: e.needContributor, curations }) : null;
        if (commit && !showLatest || (showLatest && deniedAccess)) {
            commit.data.roles = roles;
            if (deniedAccess)
                return noAccess(commitData);
            return res.status(200).json(commitData);
        }
        if (deniedAccess)
            return noAccess(commit ? commitData : null);
        // If there is no commit or client wants the latest version.
        const event = yield _Services_1.EventService.findEvent(eventId, { plain: true, getNewsroomContent: true });
        event.contribution = yield _Services_1.EventService.getContribution(event, true);
        event.roles = roles;
        event.starCount = starCount;
        event.subscriptionCount = subscriptionCount;
        event.curations = curations;
        res.status(200).json(event);
    });
}
exports.default = getEvent;

//# sourceMappingURL=getEvent.js.map
