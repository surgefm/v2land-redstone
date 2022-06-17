import { Socket } from 'socket.io';
import { Event, Stack } from '@Models';
import { StackService, AccessControlService } from '@Services';

export default function addEventToStack(socket: Socket) {
  socket.on('add event to stack', async (eventId: number, stackId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    try {
      await StackService.addEvent(stackId, eventId, clientId);
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}
