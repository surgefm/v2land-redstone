import { Stack } from '@Models';
import { StackObj } from '@Types';
import { updateStack } from '../AlgoliaService';

async function updateAlgoliaIndex({ stack, stackId }: {
  stack?: Stack | StackObj;
  stackId?: number;
}) {
  if (!stack) {
    stack = await Stack.findByPk(stackId);
  }

  return updateStack(stack);
}

export default updateAlgoliaIndex;
