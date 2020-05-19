import { Socket } from 'socket.io';
import { sequelize, Stack } from '@Models';
import _ from 'lodash';
import { StackService, AccessControlService } from '@Services';

import getRoomName from './getRoomName';

export default function updateStackOrders(socket: Socket) {
  socket.on('update stack orders', async (eventId: number, stackIdList: number[], cb: Function = () => {}) => {
    if (!_.isArray(stackIdList)) {
      return cb('Invalid input：stackList');
    }

    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    // TODO: Check user permission.
    for (const stackId of stackIdList) {
      const stack = await Stack.findByPk(stackId, { attributes: ['eventId'] });
      if (stack.eventId !== eventId) {
        return cb('The stacks need to belong to the same event');
      }
    }

    await sequelize.transaction(async transaction => {
      const queue = stackIdList.map((stackId, index) => StackService.updateStack({
        id: stackId,
        data: { order: index },
        clientId,
        transaction,
      }));
      await Promise.all(queue);
      socket.in(getRoomName(eventId)).emit('update stack orders', {
        eventId,
        stackIdList,
      });
    });
  });
}
