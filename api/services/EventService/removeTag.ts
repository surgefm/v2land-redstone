import { Event, EventTag, Tag, sequelize } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';

export default async function removeTag(eventId: number, tagId: number, clientId: number) {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该事件');
  }

  const tag = await Tag.findByPk(tagId);
  if (!tag) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该话题');
  }

  const eventTag = await EventTag.findOne({
    where: {
      tagId: tag.id,
      eventId: event.id,
    },
  });

  if (!eventTag) {
    return null;
  } else {
    await sequelize.transaction(async transaction => {
      await RecordService.destroy({
        data: eventTag,
        model: 'EventTag',
        target: eventTag.id,
        action: 'removeTagFromEvent',
        owner: clientId,
      }, { transaction });

      await eventTag.destroy({ transaction });
    });
    return eventTag;
  }
}
