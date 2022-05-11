import { Tag, sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RecordService, EventService, TagService, AccessControlService } from '@Services';

async function updateTag(req: RedstoneRequest, res: RedstoneResponse) {
  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) {
    return res.status(404).json({
      message: '无法找到该话题',
    });
  }

  const dataChange: { [index: string]: string | number | number[] } = {};
  if (req.body.name && req.body.name !== tag.name) {
    const t = await Tag.findOne({ where: { name: req.body.name } });
    if (t) {
      return res.status(400).json({
        message: '已存在同名话题',
      });
    }
    tag.name = req.body.name;
    tag.slug = await EventService.generatePinyin(tag.name);
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
    let redirectTo = await Tag.findByPk(req.body.redirectToId);
    while (redirectTo.redirectToId) {
      if (redirectTo.redirectToId === tag.id) {
        return res.status(400).json({
          message: '不可以设置循环重定向',
        });
      }
      redirectTo = await Tag.findByPk(redirectTo.redirectToId);
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
      const parentTag = await Tag.findByPk(tag.parentId);
      if (!parentTag) {
        return res.status(404).json({
          message: `无法找到上级话题 #${parentTag.name}`,
        });
      }

      const canManageNewParent = await AccessControlService.isAllowedToManageTag(
        req.session.clientId,
        parentTag.id,
      );
      if (!canManageNewParent) {
        return res.status(401).json({
          message: `你无权改变 #${parentTag.name} 的子话题`,
        });
      }
    }

    if (req.body.parentId) {
      const newParent = await Tag.findByPk(req.body.parentId);
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

      const canManageNewParent = await AccessControlService.isAllowedToManageTag(
        req.session.clientId,
        req.body.parentId,
      );

      if (!canManageNewParent) {
        return res.status(401).json({
          message: `你无权改变 #${newParent.name} 的子话题`,
        });
      }
      tag.parent = newParent;
    }

    tag.parentId = req.body.parentId;
    dataChange.parentId = req.body.parentId;

    const hierarchyPath = await TagService.getTagHierarchyPath({
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

  await sequelize.transaction(async transaction => {
    await tag.save({ transaction });
    await RecordService.update({
      data: dataChange,
      model: 'Tag',
      target: tag.id,
      action: 'updateTag',
      owner: req.session.clientId,
    }, { transaction });

    if (dataChange.redirectToId) {
      const redirectedFrom = await Tag.findAll({
        where: { redirectToId: tag.id },
        transaction,
      });
      await Promise.all(redirectedFrom.map(t => new Promise(resolve => {
        t.redirectToId = tag.redirectToId;
        t.save({ transaction }).then(resolve);
      })));
    }

    if (dataChange.parentId !== undefined) {
      await AccessControlService.updateTagParent(
        tag,
        await Tag.findByPk(tag.parentId, { transaction }),
      );

      await TagService.propagateHierarchyChange({ tag, transaction });
    }

    return res.status(201).json({
      message: '成功修改话题',
      tag,
    });
  });

  TagService.updateAlgoliaIndex({ tagId: tag.id });
}

export default updateTag;
