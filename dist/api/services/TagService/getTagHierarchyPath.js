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
exports.getTagHierarchyPath = void 0;
const _Models_1 = require("@Models");
const getTagHierarchyPath = ({ tag, parentId = tag.parentId, transaction }) => __awaiter(void 0, void 0, void 0, function* () {
    let hierarchyPath = [tag.id];
    if (parentId) {
        let parent = yield _Models_1.Tag.findByPk(parentId, { transaction });
        while (parent.parentId) {
            hierarchyPath = [parent.id, ...hierarchyPath];
            parent = yield _Models_1.Tag.findByPk(parent.parentId, { transaction });
        }
        hierarchyPath = [parent.id, ...hierarchyPath];
    }
    return hierarchyPath;
});
exports.getTagHierarchyPath = getTagHierarchyPath;
exports.default = exports.getTagHierarchyPath;

//# sourceMappingURL=getTagHierarchyPath.js.map
