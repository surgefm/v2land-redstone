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
const AlgoliaService_1 = require("../AlgoliaService");
function updateAlgoliaIndex({ tag, tagId }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tag) {
            tag = yield _Models_1.Tag.findByPk(tagId);
        }
        if (tag.status !== 'visible') {
            return (0, AlgoliaService_1.deleteTag)(tag.id);
        }
        return (0, AlgoliaService_1.updateTag)(tag);
    });
}
exports.default = updateAlgoliaIndex;

//# sourceMappingURL=updateAlgoliaIndex.js.map