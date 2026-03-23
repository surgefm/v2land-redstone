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
function getClientList(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let page = 1;
        let whereStr;
        if (req.body && req.body.page) {
            page = req.body.page;
        }
        else if (req.query && req.query.page) {
            page = parseInt(req.query.page || '1');
        }
        if (req.body && req.body.where) {
            whereStr = req.body.where;
        }
        else if (req.query && req.query.where) {
            whereStr = req.query.where;
        }
        let where;
        if (whereStr) {
            try {
                where = typeof whereStr === 'string' ? JSON.parse(whereStr) : whereStr;
            }
            catch (err) { /* happy */ }
            where = _Services_1.UtilService.convertWhereQuery(where);
        }
        const attributes = ['id', 'username'];
        const clients = yield _Models_1.Client.findAll({
            where: where || {},
            order: [['updatedAt', 'DESC']],
            attributes,
            offset: (page - 1) * 10,
            limit: 10,
        });
        res.status(200).json({ clientList: clients });
    });
}
exports.default = getClientList;

//# sourceMappingURL=getClientList.js.map
