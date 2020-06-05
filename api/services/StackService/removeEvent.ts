import { Transaction } from 'sequelize';
import { Stack } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';
import * as UtilService from '@Services/UtilService';

interface RemoveEventOptions {
  transaction?: Transaction;
  time?: Date;
}

async function removeEvent(stackId: number, clientId: number, { transaction, time }: RemoveEventOptions = {}) {
  const stack = await Stack.findByPk(stackId, { transaction });
  if (!stack) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }
  if (!stack.stackEventId) return;

  await UtilService.execWithTransaction(async transaction => {
    await RecordService.update({
      model: 'Stack',
      data: { stackEventId: null },
      before: { stackEventId: stack.stackEventId },
      target: stack.id,
      subtarget: stack.stackEventId,
      owner: clientId,
      action: 'removeEventFromStack',
      createdAt: time,
      updatedAt: time,
    }, { transaction });

    stack.stackEventId = null;
    await stack.save({ transaction });
  }, transaction);

  return stack;
}

export default removeEvent;
