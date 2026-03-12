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
exports.propagateHierarchyChange = void 0;
const _Models_1 = require("@Models");
const getTagHierarchyPath_1 = require("./getTagHierarchyPath");
const propagateHierarchyChange = ({ tag, transaction, hierarchyPath: path, }) => __awaiter(void 0, void 0, void 0, function* () {
    const hierarchyPath = path ? [...path, tag.id] : yield (0, getTagHierarchyPath_1.getTagHierarchyPath)({
        tag,
        transaction,
    });
    yield _Models_1.Tag.update({ hierarchyPath }, {
        where: { id: tag.id },
        transaction,
    });
    const children = yield _Models_1.Tag.findAll({
        where: {
            parentId: tag.id,
        },
    });
    yield Promise.all(children.map(t => (0, exports.propagateHierarchyChange)({
        tag: t,
        transaction,
        hierarchyPath,
    })));
});
exports.propagateHierarchyChange = propagateHierarchyChange;
exports.default = exports.propagateHierarchyChange;

//# sourceMappingURL=propagateHierarchyChange.js.map
