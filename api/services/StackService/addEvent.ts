import { Event, sequelize, Stack } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';

async function addEvent(stackId: number, eventId: number, clientId: number) {
  const stack = await Stack.findByPk(stackId);
  if (!stack) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }

  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该事件');
  }

  if (stack.eventId === event.id) return null;

  await sequelize.transaction(async transaction => {
    const time = new Date();
    const options = {
      model: 'Stack',
      data: { stackEventId: event.id },
      target: stack.id,
      subtarget: event.id,
      owner: clientId,
      createdAt: time,
      updatedAt: time,
    };
    if (stack.stackEventId) {
      await RecordService.update({
        before: { stackEventId: stack.stackEventId },
        action: 'updateStackEvent',
        ...options,
      }, { transaction });
    } else {
      await RecordService.create({
        action: 'addEventToStack',
        ...options,
      }, { transaction });
    }
    stack.stackEventId = event.id;
    await stack.save({ transaction });
  });

  return stack;
}

export default addEvent;

