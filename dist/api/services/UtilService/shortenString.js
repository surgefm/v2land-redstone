"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function shortenString(str, length = 100) {
    if (!str || length < 1)
        return;
    return str.length > length
        ? (str.slice(0, length - 1) + '…')
        : str;
}
exports.default = shortenString;

//# sourceMappingURL=shortenString.js.map
