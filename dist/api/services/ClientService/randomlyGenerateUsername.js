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
const _Models_1 = require("@Models");
const generateRandomAlphabetString_1 = __importDefault(require("../UtilService/generateRandomAlphabetString"));
function randomlyGenerateUsername(defaultValue = null, length = 12) {
    return __awaiter(this, void 0, void 0, function* () {
        let string = defaultValue || (0, generateRandomAlphabetString_1.default)();
        const testClient = new _Models_1.Client({ username: string });
        try {
            yield testClient.validate({ fields: ['username'] });
        }
        catch (err) {
            return randomlyGenerateUsername(null, length);
        }
        if (yield _Models_1.Client.findOne({ where: { username: string } })) {
            return randomlyGenerateUsername(null, length);
        }
        return string;
    });
}
exports.default = randomlyGenerateUsername;

//# sourceMappingURL=randomlyGenerateUsername.js.map
