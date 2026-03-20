"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alphabet = exports.charset = void 0;
exports.charset = Array.from(Array(26))
    .map((_, i) => i + 97)
    .map((x) => String.fromCharCode(x));
exports.alphabet = exports.charset;
function generateRandomAlphabetString(length = 12) {
    let string = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * exports.charset.length);
        string += exports.charset[index];
    }
    return string;
}
exports.default = generateRandomAlphabetString;

//# sourceMappingURL=generateRandomAlphabetString.js.map
