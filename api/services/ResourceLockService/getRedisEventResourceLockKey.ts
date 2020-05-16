export default function getRedisEventResourceLockKey(eventId: number) {
  return `resource-lock:event-${eventId}`;
}
