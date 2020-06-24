import { Tag, sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RecordService, EventService } from '@Services';

async function updateTag(req: RedstoneRequest, res: RedstoneResponse) {
  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) {
    return res.status(404).json({
      message: '无法找到该话题',
    });
  }

  const dataChange: { [index: string]: string } = {};
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
    const redirectTo = await Tag.findByPk(req.body.redirectToId);
    if (!redirectTo) {
      return res.status(404).json({
        message: '无法找到重定向话题',
      });
    }
    tag.redirectToId = req.body.redirectToId;
    dataChange.redirectToId = req.body.redirectToId;
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

    return res.status(201).json({
      message: '成功修改话题',
    });
  });
}

export default updateTag;
