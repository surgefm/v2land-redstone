const SeqModels = require('../../../seqModels');

async function updateElasticsearchIndex({ stack, stackId }) {
  if (!stack) {
    stack = await SeqModels.Stack.findOne({
      where: { id: stackId },
    });
  }

  if (stack.get) {
    stack = stack.get({ plain: true });
  }

  return ElasticsearchService.update({
    index: 'stacks',
    type: 'stack',
    id: stack.id,
    body: stack,
  });
}

module.exports = updateElasticsearchIndex;
