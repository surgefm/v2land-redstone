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
function createTag(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body.name) {
            return res.status(400).json({
                message: '缺少参数: name。',
            });
        }
        let { name, description } = req.body;
        name = name.trim();
        description = (description || '').trim();
        let tag = yield _Models_1.Tag.findOne({ where: { name } });
        if (tag) {
            return res.status(200).json({
                message: '已存在同名标签。',
                tag,
            });
        }
        const slug = yield _Services_1.EventService.generatePinyin(name);
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            tag = yield _Models_1.Tag.create({ name, description, slug }, { transaction });
            tag.hierarchyPath = [tag.id];
            yield tag.save({ transaction });
            yield _Services_1.RecordService.create({
                data: tag,
                model: 'Tag',
                target: tag.id,
                action: 'createTag',
                owner: req.session.clientId,
            }, { transaction });
            return res.status(201).json({
                message: '成功创建标签。',
                tag,
            });
        }));
        _Services_1.TagService.updateAlgoliaIndex({ tagId: tag.id });
    });
}
exports.default = createTag;

//# sourceMappingURL=createTag.js.map
