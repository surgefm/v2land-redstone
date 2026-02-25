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
const _Models_1 = require("@Models");
function twitterCallback(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.oauth_token && req.query.oauth_verifier)) {
            return res.status(400).json({
                message: '请求缺少 token 或 verifier',
            });
        }
        const token = req.query.oauth_token;
        const verifier = req.query.oauth_verifier;
        const auth = yield _Models_1.Auth.findOne({ where: { token } });
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        res.status(200).send(`<!DOCTYPE html>` +
            `<body>
    <script>window.location="${auth.redirect || '/auth/twitter/redirect?'}` +
            `&token=${token}` +
            `&verifier=${verifier}` +
            `&site=twitter"</script>
    </body>`);
    });
}
exports.default = twitterCallback;

//# sourceMappingURL=twitterCallback.js.map
