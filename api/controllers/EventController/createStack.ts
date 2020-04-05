import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Stack, sequelize } from '@Models';
import { EventService, RecordService, StackService } from '@Services';

async function createStack (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.param('eventName');
  const data = req.body;
  const { title, description, order, time } = data;

  if (!title) {
    return res.status(400).json({
      message: '缺少参数：title',
    });
  }

  const event = await EventService.findEvent(name);

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const id = event.id;

  await sequelize.transaction(async transaction => {
    const data = {
      status: 'pending',
      title,
      description,
      order: order || -1,
      eventId: id,
      time,
    };
    const stack = await Stack.create(data, { transaction });
    await RecordService.create({
      model: 'stack',
      data,
      target: stack.id,
      owner: req.session.clientId,
      action: 'createStack',
    }, { transaction });

    res.status(201).json({
      message: '提交成功，该进展在社区管理员审核通过后将很快开放',
      stack,
    });

    StackService.updateElasticsearchIndex({ stackId: stack.id });
  });
}

export default createStack;
