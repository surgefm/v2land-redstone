"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const lodash_1 = __importDefault(require("lodash"));
function convertWhereQuery(where) {
    if (!where)
        return {};
    for (const key of Object.keys(where)) {
        if (key === 'startsWith') {
            where[sequelize_1.Op.iLike] = `${where[key]}%`;
            delete where.startsWith;
        }
        else if (key === 'endsWith') {
            where[sequelize_1.Op.iLike] = `%${where[key]}`;
            delete where.endsWith;
        }
        else if (key === 'contains') {
            where[sequelize_1.Op.iLike] = `%${where[key]}%`;
            delete where.contains;
        }
        else if (key === 'or' && lodash_1.default.isArray(where[key])) {
            const or = where[key].map((w) => convertWhereQuery(w));
            where[sequelize_1.Op.or] = or;
            delete where.or;
        }
        else if (lodash_1.default.isArray(where[key])) {
            where[key] = { [sequelize_1.Op.in]: where[key] };
        }
        else if (lodash_1.default.isPlainObject(where[key])) {
            where[key] = convertWhereQuery(where[key]);
        }
    }
    return where;
}
exports.default = convertWhereQuery;

//# sourceMappingURL=convertWhereQuery.js.map
