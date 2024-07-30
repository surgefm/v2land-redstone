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
const _Services_1 = require("@Services");
const _Models_1 = require("@Models");
const hasTagParentPermission = (action, errorMessage) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield _Services_1.AccessControlService.isAllowed(req.session.clientId, 'all-tags', action))
        return next();
    const tagId = +req.params.tagId;
    const tag = yield _Models_1.Tag.findByPk(tagId);
    let haveAccess = true;
    if (!tag.parentId)
        haveAccess = false;
    if (haveAccess) {
        const resource = _Services_1.AccessControlService.getTagResourceId(tag.parentId);
        haveAccess = yield _Services_1.AccessControlService.isAllowed(req.session.clientId, resource, action);
    }
    if (haveAccess)
        return next();
    return res.status(403).json({
        message: errorMessage || '用户没有该权限',
    });
});
exports.default = hasTagParentPermission;

//# sourceMappingURL=hasTagParentPermission.js.map
