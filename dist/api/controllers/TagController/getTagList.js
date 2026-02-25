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
function getTagList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const where = req.body.where || { status: 'visible' };
        if (where.status !== 'visible') {
            if (!req.session.clientId) {
                where.status = 'visible';
            }
            else {
                const isEditor = yield _Services_1.AccessControlService.isClientEditor(req.session.clientId);
                if (!isEditor) {
                    where.status = 'visible';
                }
            }
        }
        const { rows, count } = yield _Models_1.Tag.findAndCountAll({
            where: _Services_1.UtilService.convertWhereQuery(where),
            include: [{
                    model: _Models_1.Event,
                    as: 'events',
                    where: { status: 'admitted' },
                    through: { attributes: [] },
                }, {
                    model: _Models_1.Client,
                    as: 'curators',
                    through: { attributes: [] },
                    required: false,
                    attributes: _Services_1.ClientService.sanitizedFields,
                }],
            order: [['updatedAt', 'DESC']],
            limit: 15,
            offset: 15 * (+req.query.page || req.body.page || 1) - 15,
        });
        res.status(200).json({ tags: rows, count });
    });
}
exports.default = getTagList;

//# sourceMappingURL=getTagList.js.map
