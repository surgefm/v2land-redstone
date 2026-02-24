import { Socket } from 'socket.io';

/**
 * Wraps a Socket so that any async event handler registered via `.on()`
 * automatically catches rejected promises and forwards the error message
 * to the callback (the last argument), preventing unhandled rejections
 * from crashing the process.
 */
export default function wrapSocket(socket: Socket): Socket {
  const originalOn = socket.on.bind(socket);

  socket.on = function(event: string, handler: (...args: any[]) => any) {
    return originalOn(event, async (...args: any[]) => {
      try {
        await handler(...args);
      } catch (err) {
        console.error(`[Socket] Error in handler "${event}":`, err);
        // Convention: the last argument is a callback function
        const cb = args[args.length - 1];
        if (typeof cb === 'function') {
          cb(err instanceof Error ? err.message : String(err));
        }
      }
    });
  } as any;

  return socket;
}
