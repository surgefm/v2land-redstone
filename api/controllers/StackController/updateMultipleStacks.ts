import { RedstoneRequest, RedstoneResponse } from '@Types';
import { sequelize } from '@Models';
import { StackService } from '@Services';
import * as _ from 'lodash';

async function updateMultipleStacks (req: RedstoneRequest, res: RedstoneResponse) {
  const { stackList } = req.body;

  if (!_.isArray(stackList)) {
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
    return res.status(201).json({
      message: '修改成功',
    });
  });
}

export default updateMultipleStacks;
