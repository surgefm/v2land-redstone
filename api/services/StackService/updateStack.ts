import { Stack } from '@Models';
import { StackObj } from '@Types';
import * as NotificationService from '../NotificationService';
import * as RecordService from '../RecordService';
import addEvent from './addEvent';
import updateAlgoliaIndex from './updateAlgoliaIndex';
import { Transaction } from 'sequelize/types';

async function updateStack({ id = -1, data = {}, clientId, transaction }: {
  id?: number;
  data?: { enableNotification?: boolean; forceUpdate?: boolean } & StackObj;
  clientId?: number;
  transaction?: Transaction;
}) {
  const stack = await Stack.findOne({
    where: { id },
    transaction,
  });

  if (!stack) {
    throw new Error(JSON.stringify({
      status: 404,
      message: {
        message: '未找到该进展',
      },
    }));
  }

  const stackObj = stack.get({ plain: true }) as StackObj;
  const oldStack = stackObj;

  const changes: StackObj = {};
  for (const i of ['title', 'description', 'status', 'order', 'time', 'stackEventId']) {
    if (typeof (data as any)[i] !== 'undefined' && (data as any)[i] !== (stackObj as any)[i]) {
      (changes as any)[i] = (data as any)[i];
    }
  }

  if (Object.getOwnPropertyNames(changes).length === 0) {
    return {
      status: 200,
      message: {
        message: '什么变化也没有发生',
        stack: stackObj,
      },
    };
  }

  const changesCopy = { ...changes };

  if (changes.status) {
    if (changes.status === 'admitted') {
      const newsCount = await stack.$count('news', {
        where: { status: 'admitted' },
        transaction,
      });

      if (newsCount === 0) {
        throw new Error('一个进展必须在含有一个已过审新闻的情况下方可开放');
      }
    }

    stack.status = changes.status;
    stackObj.status = changes.status;
    await stack.save({ transaction });

    await RecordService.create({
      action: 'updateStackStatus',
      data: { status: changes.status },
      before: { status: stackObj.status },
      target: id,
      owner: clientId,
      model: 'Stack',
    }, { transaction });
  }

  delete changes.status;

  if (changes.stackEventId) {
    await addEvent(stack.id, changes.stackEventId, clientId);
    stack.stackEventId = changes.stackEventId;
    delete changes.stackEventId;
  }

  if (Object.keys(changes).length) {
    for (const i of ['title', 'description', 'status', 'order', 'time']) {
      if (typeof (changes as any)[i] !== 'undefined') {
        (stack as any)[i] = (changes as any)[i];
      }
    }
    await stack.save({ transaction });

    await RecordService.create({
      action: 'updateStackDetail',
      target: id,
      owner: clientId,
      data: changes,
      before: JSON.stringify(stackObj),
      model: 'Stack',
    }, { transaction });
  }

  setTimeout(() => {
    if (data.enableNotification && (
      changesCopy.status === 'admitted' ||
      (typeof changesCopy.order !== 'undefined' && stack.status === 'admitted')
    )) {
      NotificationService.updateStackNotifications(stack, { force: data.forceUpdate });
      NotificationService.notifyWhenStackStatusChanged(oldStack, stack, clientId);
    }

    updateAlgoliaIndex({ stackId: stack.id });
  });

  return {
    status: 201,
    message: {
      message: '修改成功',
      stack,
    },
  };
}

export default updateStack;
