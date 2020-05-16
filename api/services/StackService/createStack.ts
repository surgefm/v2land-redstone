import { Stack } from '@Models';
import { Transaction } from 'sequelize';
import { StackObj, RedstoneError, InvalidInputErrorType, ResourceNotFoundErrorType } from '@Types';

import * as EventService from '@Services/EventService';
import * as RecordService from '@Services/RecordService';
import * as UtilService from '@Services/UtilService';
import updateElasticsearchIndex from './updateElasticsearchIndex';

async function createStack(eventId: number | string, data: StackObj, clientId: number, transaction?: Transaction) {
  const { title, description, order, time } = data;

  if (!title) {
    throw new RedstoneError(InvalidInputErrorType, '缺少参数：title');
  }

  const event = await EventService.findEvent(eventId);

  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, '未找到该事件');
  }

  let stack: Stack = null;
  await UtilService.execWithTransaction(async transaction => {
    const data = {
      status: 'pending',
      title,
      description,
      order: order || -1,
      eventId: event.id,
      time,
    };
    stack = await Stack.create(data, { transaction });
    await RecordService.create({
      model: 'stack',
      data,
      target: stack.id,
      owner: clientId,
      action: 'createStack',
    }, { transaction });
  }, transaction);

  updateElasticsearchIndex({ stackId: stack.id });
  return stack;
}

export default createStack;
