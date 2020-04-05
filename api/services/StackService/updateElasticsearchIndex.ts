import { Stack } from '@Models';
import { StackObj } from '@Types';
import * as ElasticsearchService from '../ElasticsearchService';

async function updateElasticsearchIndex({ stack, stackId }: {
  stack?: Stack | StackObj;
  stackId?: number;
}) {
  if (!stack) {
    stack = await Stack.findOne({
      where: { id: stackId },
    });
  }

  if (stack instanceof Stack) {
    stack = stack.get({ plain: true }) as StackObj;
  }

  return ElasticsearchService.update({
    index: 'stacks',
    id: stack.id + '',
    body: {
      'doc': stack,
      'doc_as_upsert': true,
    },
  });
}

export default updateElasticsearchIndex;
