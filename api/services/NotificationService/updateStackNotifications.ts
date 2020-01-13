import { sequelize } from '@Types';
import { Record, Event, Stack, Notification } from '@Models';
import * as ModeService from '../ModeService';
import { Transaction, Op } from 'sequelize';

async function updateStackNotifications(
  stack: Stack,
  { transaction, force = false }: {
    transaction?: Transaction,
    force?: boolean,
  } = {},
) {
  const latestStack = await Stack.findOne({
    where: {
      eventId: stack.eventId,
      status: 'admitted',
      order: { [Op.gte]: 0 },
    },
    order: [['order', 'DESC']],
    attributes: ['id'],
    transaction,
  });

  if (!force && (!latestStack || (+latestStack.id !== +stack.id))) return;

  const recordCount = await Record.count({
    where: {
      model: 'Stack',
      target: stack.id,
      action: 'notifyNewStack',
    },
    transaction,
  });

  if (!force && recordCount) return;

  let event = stack.event;
  if (typeof event !== 'object') {
    event = await Event.findByPk(stack.eventId, { transaction });
  }

  if (!transaction) {
    await sequelize.transaction(async transaction => {
      return updateNotifications(event, stack, transaction);
    });
  } else {
    return updateNotifications(event, stack, transaction);
  }
}

async function updateNotifications(event: Event, stack: Stack, transaction: Transaction) {
  const modes = ['EveryNewStack', '30DaysSinceLatestStack'];

  for (const mode of modes) {
    if (ModeService.getMode(mode).keepLatestOnly) {
      await Notification.update({
        status: 'discarded',
      }, {
        where: {
          eventId: event.id,
          mode,
        },
        transaction,
      });
    }
    await Notification.create({
      time: await ModeService.getMode(mode).new({ event, stack, transaction }),
      status: 'pending',
      eventId: event.id,
      mode,
    }, { transaction });
  }

  await Record.create({
    model: 'Stack',
    target: stack.id,
    operation: 'create',
    action: 'notifyNewStack',
  }, { transaction });
}

export default updateStackNotifications;
