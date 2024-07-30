"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorStatusCode = exports.ResourceNotFoundErrorType = exports.InvalidInputErrorType = exports.RedstoneErrorIdentifier = void 0;
exports.RedstoneErrorIdentifier = 'REDSTONE_ERROR';
exports.InvalidInputErrorType = 'Invalid input';
exports.ResourceNotFoundErrorType = 'Resource not found';
exports.ErrorStatusCode = {
    [exports.InvalidInputErrorType]: 400,
    [exports.ResourceNotFoundErrorType]: 404,
};
class RedstoneError extends Error {
    constructor(errorType, message, statusCode = 400) {
        super(message);
        this.name = exports.RedstoneErrorIdentifier;
        this.errorType = errorType;
        this.message = message;
        this.statusCode = exports.ErrorStatusCode[errorType] || statusCode;
    }
}
exports.default = RedstoneError;

//# sourceMappingURL=RedstoneError.js.map
