import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventTag, Tag, sequelize } from '@Models';
import { EventService, RecordService } from '@Services';

async function addTag(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body.tag) {
    return res.status(400).json({
      message: '缺少参数：tag',
    });
  }

  const name = req.params.eventName;
  const event = await EventService.findEvent(name, { eventOnly: true });
  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const tag = await Tag.findByPk(req.body.tag);
  if (!tag) {
    return res.status(404).json({
      message: '未找到该标签',
    });
  }

  let eventTag = await EventTag.findOne({
    where: {
      tagId: tag.id,
      eventId: event.id,
    },
  });

  if (eventTag) {
    return res.status(200).json({
      message: `事件「${event.name}」已有标签「${tag.name}」。`,
    });
  } else {
    await sequelize.transaction(async transaction => {
      eventTag = await EventTag.create({
        tagId: tag.id,
        eventId: event.id,
      }, { transaction });

      await RecordService.create({
        data: eventTag,
        model: 'EventTag',
        target: eventTag.id,
        action: 'addTagToEvent',
        owner: req.session.clientId,
      }, { transaction });

      return res.status(201).json({
        message: `成功将标签「${tag.name}」添加至事件「${event.name}」中。`,
      });
    });
  }
}

export default addTag;
