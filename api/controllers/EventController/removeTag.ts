import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventTag, Tag, sequelize } from '@Models';
import { EventService, RecordService } from '@Services';

async function removeTag(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name, { eventOnly: true });
  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const tag = await Tag.findByPk(req.params.tagId);
  if (!tag) {
    return res.status(404).json({
      message: '未找到该标签',
    });
  }

  const eventTag = await EventTag.findOne({
    where: {
      tagId: tag.id,
      eventId: event.id,
    },
  });

  if (eventTag) {
    return res.status(200).json({
      message: `事件「${event.name}」并无标签「${tag.name}」。`,
    });
  } else {
    await sequelize.transaction(async transaction => {
      await RecordService.destroy({
        data: eventTag,
        model: 'EventTag',
        target: eventTag.id,
        action: 'removeTagFromEvent',
        owner: req.session.clientId,
      }, { transaction });

      await eventTag.destroy({ transaction });

      return res.status(201).json({
        message: `成功将标签「${tag.name}」从事件「${event.name}」中移除。`,
      });
    });
  }
}

export default removeTag;
