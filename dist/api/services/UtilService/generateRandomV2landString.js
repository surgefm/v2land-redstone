"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateRandomV2landString(length) {
    const charset = ['🧜‍♀️', '🧜‍♂️', '🐠', '🐟', '🐬', '🐳', '🐋',
        '💧', '💦', '🌊', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️', '🏊‍♂️', '🚣‍♀️', '🚣‍♂️',
        '🚤', '🛥', '⛵️', '🛶', '🛳', '⛴', '🚢', '💙', '🏖', '🏝'];
    let string = '';
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * charset.length);
        string += charset[index];
    }
    return string;
}
exports.default = generateRandomV2landString;

//# sourceMappingURL=generateRandomV2landString.js.map
