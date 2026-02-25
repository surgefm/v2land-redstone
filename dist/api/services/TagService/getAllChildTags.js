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
exports.getAllChildTags = void 0;
const _Models_1 = require("@Models");
const getAllChildTags = ({ tag: t, tagId, transaction, }) => __awaiter(void 0, void 0, void 0, function* () {
    const tag = t || (yield _Models_1.Tag.findByPk(tagId, { transaction }));
    if (!tag)
        return [];
    return _Models_1.sequelize.query(`
    SELECT *
    FROM tag
    WHERE "hierarchyPath" @> ARRAY[${(tag.hierarchyPath || [tag.id]).join(',')}]
    AND id != ${tag.id}
  `, {
        type: _Models_1.Sequelize.QueryTypes.SELECT,
    });
});
exports.getAllChildTags = getAllChildTags;
exports.default = exports.getAllChildTags;

//# sourceMappingURL=getAllChildTags.js.map
