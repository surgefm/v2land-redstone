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
const _Configs_1 = require("@Configs");
function weiboCallback(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.code && req.query.state)) {
            return res.status(400).json({
                message: '请求缺少 code 或 state 参数',
            });
        }
        const { code, state } = req.query;
        const auth = yield _Models_1.Auth.findByPk(state);
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        if (auth.redirect) {
            res.status(200).send(`<!DOCTYPE html>` +
                `<body>
      <script>window.location="${auth.redirect}` +
                `&code=${code}` +
                `&authId=${state}` +
                `&site=weibo` +
                `"</script>
      </body>`);
        }
        else {
            res.status(200).send(`<!DOCTYPE html>` +
                `<body>
      <script>window.location="${_Configs_1.globals.api}/auth/weibo/redirect` +
                `?code=${code}` +
                `&authId=${state}` +
                `&site=weibo` +
                `"</script>
      </body>`);
        }
    });
}
exports.default = weiboCallback;

//# sourceMappingURL=weiboCallback.js.map
