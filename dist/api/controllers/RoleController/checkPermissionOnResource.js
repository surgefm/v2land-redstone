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
function checkPermissionOnResource(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = parseInt(req.params.clientId);
        const resourceId = req.params.resourceId;
        const action = req.params.action;
        const haveAccess = yield _Services_1.AccessControlService.isAllowed(clientId, resourceId, action);
        return res.status(200).json({ haveAccess });
    });
}
exports.default = checkPermissionOnResource;

//# sourceMappingURL=checkPermissionOnResource.js.map
