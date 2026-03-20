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
function getTag(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = yield _Models_1.Tag.findByPk(req.params.tagId, {
            include: [{
                    model: _Models_1.Client,
                    as: 'curators',
                    through: { attributes: [] },
                    required: false,
                    attributes: _Services_1.ClientService.sanitizedFields,
                }],
        });
        let tagVisible = !tag || tag.status !== 'hidden';
        if (!tagVisible && req.currentClient) {
            if (req.currentClient.isEditor) {
                tagVisible = true;
            }
        }
        if (!tag || !tagVisible) {
            return res.status(404).json({
                message: '无法找到该标签',
            });
        }
        const allChildTags = yield _Services_1.TagService.getAllChildTags({ tag });
        const ids = [tag.id, ...allChildTags.map(t => t.id)];
        const tagObj = tag.get({ plain: true });
        const eventTags = yield _Models_1.EventTag.findAll({
            where: {
                tagId: {
                    [_Models_1.Sequelize.Op.in]: ids,
                },
            },
        });
        const eventIds = Array.from(new Set(eventTags.map(t => t.eventId)));
        const events = yield Promise.all(eventIds.map((id) => __awaiter(this, void 0, void 0, function* () {
            const event = yield _Models_1.Event.findOne({
                where: {
                    id,
                    status: 'admitted',
                },
                include: [{
                        model: _Models_1.News,
                        as: 'latestAdmittedNews',
                        required: false,
                    }],
            });
            if (!event)
                return;
            const eventObj = event.get({ plain: true });
            eventObj.curations = yield _Services_1.EventService.getCurations(event.id);
            return eventObj;
        })));
        tagObj.events = events.filter(e => e).sort((a, b) => {
            const isACertified = a.curations.find((c) => c.state === 'certified');
            const isBCertified = b.curations.find((c) => c.state === 'certified');
            const isAWarned = a.curations.find((c) => c.state === 'warning');
            const isBWarned = b.curations.find((c) => c.state === 'warning');
            if (isAWarned && !isBWarned)
                return 1;
            if (!isAWarned && isBWarned)
                return -1;
            if (isACertified && !isBCertified)
                return -1;
            if (!isACertified && isBCertified)
                return 1;
            return a.updatedAt > b.updatedAt ? -1 : 1;
        });
        tagObj.parents = yield Promise.all((tag.hierarchyPath || [])
            .filter(t => t !== tag.id)
            .map(t => _Models_1.Tag.findByPk(t)));
        tagObj.children = yield _Models_1.Tag.findAll({
            where: {
                parentId: tag.id,
            },
        });
        return res.status(200).json({ tag: tagObj });
    });
}
exports.default = getTag;

//# sourceMappingURL=getTag.js.map
