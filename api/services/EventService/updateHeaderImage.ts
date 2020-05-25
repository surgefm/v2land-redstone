import { RedstoneError, InvalidInputErrorType, ResourceNotFoundErrorType } from '@Types';
import { Event, HeaderImage, sequelize } from '@Models';
import * as RecordService from '@Services/RecordService';
import isURL from '@Utils/urlValidator';
import updateElasticsearchIndex from './updateElasticsearchIndex';

async function updateHeaderImage(eventId: number, data: { [index: string]: string }, clientId: number) {
  const event = await Event.findByPk(eventId, {
    include: [{
      model: HeaderImage,
      as: 'headerImage',
      required: false,
    }],
  });

  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该事件`);
  }

  let headerImage: any = { eventId };

  for (const attribute of ['imageUrl', 'source', 'sourceUrl']) {
    headerImage[attribute] = data[attribute];
  }

  if (headerImage.imageUrl && !headerImage.source) {
    throw new RedstoneError(InvalidInputErrorType, '请提供题图来源');
  }

  if (headerImage.sourceUrl && !isURL(headerImage.sourceUrl)) {
    throw new RedstoneError(InvalidInputErrorType, '链接格式不规范');
  }

  const query = {
    model: 'HeaderImage',
    owner: clientId,
    data: headerImage,
  };

  await sequelize.transaction(async transaction => {
    if (event.headerImage) {
      if (headerImage.imageUrl) {
        for (const key of Object.keys(headerImage)) {
          (event.headerImage as any)[key] = headerImage[key];
        }
        await event.headerImage.save({ transaction });
        await RecordService.update({
          ...query,
          action: 'updateEventHeaderImage',
          target: event.headerImage.id,
          before: event.headerImage,
        }, { transaction });
        headerImage = event.headerImage;
      } else {
        await HeaderImage.destroy({
          where: { eventId },
          transaction,
        });
        await RecordService.destroy({
          ...query,
          action: 'destroyEventHeaderImage',
          target: event.headerImage.id,
          before: event.headerImage,
        }, { transaction });
        headerImage = {};
      }
    } else {
      headerImage = await HeaderImage.create({
        ...headerImage,
        eventId: event.id,
      }, { transaction });
      await RecordService.create({
        ...query,
        target: headerImage.id,
        action: 'createEventHeaderImage',
      }, { transaction });
    }
  });

  updateElasticsearchIndex({ eventId });

  return headerImage as HeaderImage;
}

export default updateHeaderImage;
