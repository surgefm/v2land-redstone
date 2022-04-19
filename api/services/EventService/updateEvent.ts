import { Event, Client, sequelize } from '@Models';
import { EventObj } from '@Types';
import * as RecordService from '@Services/RecordService';
import * as RedisService from '@Services/RedisService';
import * as NotificationService from '@Services/NotificationService';
import generatePinyin from './generatePinyin';
import updateAlgoliaIndex from './updateAlgoliaIndex';

async function updateEvent(event: Event, data: EventObj, client: Client) {
  const changes: any = {};
  for (const attribute of ['name', 'description', 'status']) {
    if (data[attribute] && data[attribute] !== (event as EventObj)[attribute]) {
      changes[attribute] = data[attribute];
    }
  }

  if (Object.getOwnPropertyNames(changes).length === 0) null;

  if (changes.name) {
    changes.pinyin = await generatePinyin(changes.name);
  }

  await sequelize.transaction(async transaction => {
    const query = {
      model: 'Event',
      owner: client.id,
    };

    if (changes.status) {
      event.status = changes.status;
      await event.save({ transaction });

      await RecordService.update({
        ...query,
        action: 'updateEventStatus',
        data: { status: changes.status },
        before: event.status,
        target: event.id,
      }, { transaction });
    }

    NotificationService.notifyWhenEventStatusChanged(event, changes, client);

    delete changes.status;
    const before: any = {};
    for (const i of Object.keys(changes)) {
      before[i] = (event as EventObj)[i];
    }

    if (Object.keys(changes).length > 0) {
      for (const key of Object.keys(changes)) {
        (event as any)[key] = changes[key];
      }
      await event.save({ transaction });

      await RecordService.update({
        ...query,
        action: 'updateEventDetail',
        data: changes,
        before,
        target: event.id,
      }, { transaction });
    }
  });

  if (event.ownerId) {
    await RedisService.set(RedisService.getEventIdKey(event.name, event.ownerId), event.id);
    const client = await Client.findByPk(event.ownerId, { attributes: ['id'] });
    await RedisService.set(RedisService.getEventIdKey(event.name, client.username), event.id);
  }
  updateAlgoliaIndex({ eventId: event.id });

  return event;
}

export default updateEvent;
