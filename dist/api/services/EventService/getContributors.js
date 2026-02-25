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
function getContributors(eventId, { transaction } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return _Models_1.sequelize.query(`
    SELECT DISTINCT ON ("contributorId") "contributorId", *
    FROM public."eventContributor"
    WHERE "eventId" = ${eventId}
    ORDER BY "contributorId", "createdAt" DESC
  `, {
            transaction,
            type: _Models_1.Sequelize.QueryTypes.SELECT,
        });
    });
}
exports.default = getContributors;

//# sourceMappingURL=getContributors.js.map
