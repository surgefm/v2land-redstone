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
const _Configs_1 = require("@Configs");
function options(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).json({
            twitter: _Configs_1.oauth.twitter ? true : false,
            weibo: _Configs_1.oauth.weibo ? true : false,
        });
    });
}
exports.default = options;

//# sourceMappingURL=options.js.map
