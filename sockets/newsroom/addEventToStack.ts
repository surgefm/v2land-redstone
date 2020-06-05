import { Socket } from 'socket.io';
import { Event, Stack } from '@Models';
import { StackService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function addEventToStack(socket: Socket) {
  socket.on('add event to stack', async (eventId: number, stackId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const s = await StackService.addEvent(stackId, eventId, clientId);
    if (s) {
      socket.in(getRoomName(stack.eventId)).emit('add event to stack', {
        eventId,
        stackId,
        client: socket.handshake.session.currentClient,
      });
    }
    cb();
  });
}
