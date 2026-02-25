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
const _Services_1 = require("@Services");
function updateStack(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = +req.params.stackId;
        const data = req.body;
        try {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const cb = yield _Services_1.StackService.updateStack({
                    id,
                    data,
                    clientId: req.session.clientId,
                    transaction,
                });
                return res.status(cb.status).json(cb.message);
            }));
        }
        catch (err) {
            if (err.message === '一个进展必须在含有一个已过审新闻的情况下方可开放') {
                return res.status(400).json({ message: err.message });
            }
        }
    });
}
exports.default = updateStack;

//# sourceMappingURL=updateStack.js.map
