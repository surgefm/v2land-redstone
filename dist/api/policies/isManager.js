"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(req, res, next) {
    if (req.currentClient.isManager) {
        next();
    }
    else {
        return res.status(403).json({
            message: '您没有权限进行该操作',
        });
    }
}
exports.default = default_1;

//# sourceMappingURL=isManager.js.map
