import { Tag, sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RecordService, EventService } from '@Services';

async function createTag(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body.name) {
    return res.status(400).json({
      message: '缺少参数：name。',
    });
  }

  let { name, description } = req.body;
  name = name.trim();
  description = (description || '').trim();

  let tag = await Tag.findOne({ where: { name } });
  if (tag) {
    return res.status(200).json({
      message: '已存在同名标签。',
      tag,
    });
  }
  const slug = await EventService.generatePinyin(name);

  await sequelize.transaction(async transaction => {
    tag = await Tag.create({ name, description, slug }, { transaction });

    await RecordService.create({
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
  });
}

export default createTag;
