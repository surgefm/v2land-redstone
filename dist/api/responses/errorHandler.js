"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _Types_1 = require("@Types");
const http_1 = require("http");
function errorHandler(err, req, res, next) {
    if (!err || err instanceof http_1.ServerResponse)
        return next();
    (req.log || console).error(err.message);
    if (err.name === 'SequelizeValidationError') {
        res.status(400).json({
            error: _Types_1.InvalidInputErrorType,
            message: err.errors.map(e => e.message).join('；'),
        });
        return next();
    }
    else if (err.name === _Types_1.RedstoneErrorIdentifier) {
        const redstoneErr = err;
        res.status(redstoneErr.statusCode).json({
            error: redstoneErr.errorType,
            message: redstoneErr.message,
        });
        return next();
    }
    res.status(400).json({
        message: err.message,
    });
    next();
}
exports.default = errorHandler;

//# sourceMappingURL=errorHandler.js.map
