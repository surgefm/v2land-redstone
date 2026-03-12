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
function updateTag(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tag = yield _Models_1.Tag.findByPk(req.params.tagId);
        if (!tag) {
            return res.status(404).json({
                message: '无法找到该话题',
            });
        }
        const dataChange = {};
        if (req.body.name && req.body.name !== tag.name) {
            const t = yield _Models_1.Tag.findOne({ where: { name: req.body.name } });
            if (t) {
                return res.status(400).json({
                    message: '已存在同名话题',
                });
            }
            tag.name = req.body.name;
            tag.slug = yield _Services_1.EventService.generatePinyin(tag.name);
            dataChange.name = req.body.name;
            dataChange.slug = tag.slug;
        }
        if (req.body.description && req.body.description !== tag.description) {
            tag.description = req.body.description;
            dataChange.description = req.body.description;
        }
        if (req.body.redirectToId) {
            if (!req.currentClient.isEditor) {
                return res.status(403).json({
                    message: '只有社区编辑或管理员可以更改话题重定向',
                });
            }
            let redirectTo = yield _Models_1.Tag.findByPk(req.body.redirectToId);
            while (redirectTo.redirectToId) {
                if (redirectTo.redirectToId === tag.id) {
                    return res.status(400).json({
                        message: '不可以设置循环重定向',
                    });
                }
                redirectTo = yield _Models_1.Tag.findByPk(redirectTo.redirectToId);
            }
            if (!redirectTo) {
                return res.status(404).json({
                    message: '无法找到重定向话题',
                });
            }
            tag.redirectToId = redirectTo.id;
            dataChange.redirectToId = redirectTo.id;
        }
        if (tag.parentId !== req.body.parentId) {
            if (tag.parentId) {
                const parentTag = yield _Models_1.Tag.findByPk(tag.parentId);
                if (!parentTag) {
                    return res.status(404).json({
                        message: `无法找到上级话题 #${parentTag.name}`,
                    });
                }
                const canManageNewParent = yield _Services_1.AccessControlService.isAllowedToManageTag(req.session.clientId, parentTag.id);
                if (!canManageNewParent) {
                    return res.status(401).json({
                        message: `你无权改变 #${parentTag.name} 的子话题`,
                    });
                }
            }
            if (req.body.parentId) {
                const newParent = yield _Models_1.Tag.findByPk(req.body.parentId);
                if (!newParent) {
                    return res.status(404).json({
                        message: `无法找到上级话题 #${newParent.name}`,
                    });
                }
                if ((newParent.hierarchyPath || []).includes(tag.id)) {
                    return res.status(400).json({
                        message: '话题层级不能出现回路',
                    });
                }
                const canManageNewParent = yield _Services_1.AccessControlService.isAllowedToManageTag(req.session.clientId, req.body.parentId);
                if (!canManageNewParent) {
                    return res.status(401).json({
                        message: `你无权改变 #${newParent.name} 的子话题`,
                    });
                }
                tag.parent = newParent;
            }
            tag.parentId = req.body.parentId;
            dataChange.parentId = req.body.parentId;
            const hierarchyPath = yield _Services_1.TagService.getTagHierarchyPath({
                tag,
                parentId: req.body.parentId,
            });
            tag.hierarchyPath = hierarchyPath;
            dataChange.hierarchyPath = hierarchyPath;
        }
        if (req.body.status && req.body.status !== tag.status) {
            if (!['visible', 'hidden'].includes(req.body.status)) {
                return res.status(400).json({
                    message: '话题状态必须为 visible 或 hidden。',
                });
            }
            if (!req.currentClient.isEditor) {
                return res.status(403).json({
                    message: '只有社区编辑或管理员可以更改话题状态',
                });
            }
            tag.status = req.body.status;
            dataChange.status = req.body.status;
        }
        if (Object.keys(dataChange).length === 0) {
            return res.status(200).json({
                message: '没有进行任何改变',
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            yield tag.save({ transaction });
            yield _Services_1.RecordService.update({
                data: dataChange,
                model: 'Tag',
                target: tag.id,
                action: 'updateTag',
                owner: req.session.clientId,
            }, { transaction });
            if (dataChange.redirectToId) {
                const redirectedFrom = yield _Models_1.Tag.findAll({
                    where: { redirectToId: tag.id },
                    transaction,
                });
                yield Promise.all(redirectedFrom.map(t => new Promise(resolve => {
                    t.redirectToId = tag.redirectToId;
                    t.save({ transaction }).then(resolve);
                })));
            }
            if (dataChange.parentId !== undefined) {
                yield _Services_1.AccessControlService.updateTagParent(tag, yield _Models_1.Tag.findByPk(tag.parentId, { transaction }));
                yield _Services_1.TagService.propagateHierarchyChange({ tag, transaction });
            }
            return res.status(201).json({
                message: '成功修改话题',
                tag,
            });
        }));
        _Services_1.TagService.updateAlgoliaIndex({ tagId: tag.id });
    });
}
exports.default = updateTag;

//# sourceMappingURL=updateTag.js.map
