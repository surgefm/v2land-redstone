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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pinyin_1 = __importDefault(require("pinyin"));
function generatePinyin(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const array = (0, pinyin_1.default)(name.toLowerCase(), {
            segment: false,
            style: 0,
        });
        const characters = [];
        for (let i = 0; i < Math.min(array.length, 9); i++) {
            if (/^[a-z]*$/.test(array[i][0])) {
                characters.push(array[i][0]);
            }
        }
        return characters.length > 1
            ? characters.join('-')
            : characters[0];
    });
}
exports.default = generatePinyin;

//# sourceMappingURL=generatePinyin.js.map
