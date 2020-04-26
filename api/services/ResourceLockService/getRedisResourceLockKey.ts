export default function getRedisResourceLockKey(model: string, resourceId: number) {
  return `resource-lock-${model}-${resourceId}`;
}
