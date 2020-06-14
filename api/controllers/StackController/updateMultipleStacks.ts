import { RedstoneRequest, RedstoneResponse } from '@Types';
import { sequelize, Stack } from '@Models';
import { StackService, RecordService } from '@Services';
import _ from 'lodash';

async function updateMultipleStacks(req: RedstoneRequest, res: RedstoneResponse) {
  const { stackList } = req.body;

  if (!_.isArray(stackList) || stackList.length === 0) {
    return res.status(400).json({
      message: '错误的输入参数：stackList',
    });
  }

  await sequelize.transaction(async transaction => {
    const queue = stackList.map(stack => StackService.updateStack({
      id: stack.id,
      data: stack,
      clientId: req.session.clientId,
      transaction,
    }));
    await Promise.all(queue);
    const updateOrder = stackList.filter(s => s.order !== undefined).length === stackList.length;
    const stack = await Stack.findByPk(stackList[0].id);
    if (updateOrder) {
      await RecordService.update({
        model: 'Event',
        target: stack.eventId,
        owner: req.session.clientId,
        action: 'updateStackOrders',
      }, { transaction });
    }

    return res.status(201).json({
      message: '修改成功',
    });
  });
}

export default updateMultipleStacks;
