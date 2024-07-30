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
exports.updateTagParent = void 0;
const operations_1 = require("@Services/AccessControlService/operations");
const getTagRoles_1 = require("./getTagRoles");
const updateTagParent = (tag, parent) => __awaiter(void 0, void 0, void 0, function* () {
    const tagRole = yield (0, getTagRoles_1.getTagManageRole)(tag.id);
    if (tag.parentId) {
        const existingParentRole = yield (0, getTagRoles_1.getTagManageRole)(tag.parentId);
        yield (0, operations_1.removeRoleParents)(tagRole, existingParentRole);
    }
    if (parent) {
        const newParentRole = yield (0, getTagRoles_1.getTagManageRole)(parent.id);
        yield (0, operations_1.addRoleParents)(tagRole, newParentRole);
    }
});
exports.updateTagParent = updateTagParent;
exports.default = exports.updateTagParent;

//# sourceMappingURL=updateTagParent.js.map
