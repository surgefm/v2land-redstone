"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file utils/errors/MissingParameterError.js
 */
class MissingParameterError extends Error {
    constructor(parameters) {
        let string = 'Missing parameters';
        if (parameters) {
            string += ': ';
            if (typeof parameters === 'string') {
                string += parameters;
            }
            else {
                string += parameters.join(', ');
            }
        }
        string += '.';
        super(string);
        Error.captureStackTrace(this, MissingParameterError);
    }
}
exports.default = MissingParameterError;

//# sourceMappingURL=MissingParameterError.js.map
