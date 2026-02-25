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
const sequelize_1 = require("sequelize");
const _Models_1 = require("@Models");
function getContribution(news, withData, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const records = yield _Models_1.Record.findAll({
            attributes: withData ? undefined : {
                exclude: ['data', 'before'],
            },
            where: {
                action: {
                    [sequelize_1.Op.or]: ['updateNewsStatus', 'updateNewsDetail', 'createNews'],
                },
                target: news.id,
            },
            include: [{
                    model: _Models_1.Client,
                    as: 'ownedBy',
                    required: false,
                    attributes: ['username', 'role', 'id'],
                }],
            transaction,
        });
        return records;
    });
}
exports.default = getContribution;

//# sourceMappingURL=getContribution.js.map
