import { Stack } from '@Models';
import { StackObj } from '@Types';
import { updateStack, deleteStack } from '../AlgoliaService';

async function updateAlgoliaIndex({ stack, stackId }: {
  stack?: Stack | StackObj;
  stackId?: number;
}) {
  if (!stack) {
    stack = await Stack.findByPk(stackId);
  }

  if (stack.status !== 'admitted' || stack.order < 0) {
    return deleteStack(stack.id);
  }

  return updateStack(stack);
}

export default updateAlgoliaIndex;
