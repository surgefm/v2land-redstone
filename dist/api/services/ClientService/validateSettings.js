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
function validateSettings(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const attr of Object.keys(settings)) {
            switch (attr) {
                case 'defaultSubscriptionMethod':
                    if (!['EveryNewStack', '30DaysSinceLatestStack'].includes(settings[attr])) {
                        throw new Error(`'defaultSubscriptionMethod' 字段不得为 ${settings[attr]}`);
                    }
                    break;
                default:
                    throw new Error(`不存在 '${attr}' 字段`);
            }
        }
    });
}
exports.default = validateSettings;

//# sourceMappingURL=validateSettings.js.map
