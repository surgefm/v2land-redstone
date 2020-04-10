import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, RecordService, NotificationService, CommitService } from '@Services';
import { Event, sequelize } from '@Models';

async function createEvent (req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.body && req.body.name && req.body.description)) {
    return res.status(400).json({
      message: '缺少参数 name 或 description',
    });
  }

  const data: { [index: string]: any } = {
    name: req.body.name,
    description: req.body.description,
  };

  let event = await EventService.findEvent(data.name);

  if (event) {
    return res.status(409).json({
      message: '已有同名事件或事件正在审核中',
    });
  }

  data.status = 'pending';

  data.pinyin = await EventService.generatePinyin(data.name);

  await sequelize.transaction(async transaction => {
    event = await Event.create(data, { transaction });
    await RecordService.create({
      model: 'Event',
      data,
      action: 'createEvent',
      owner: req.session.clientId,
      target: event.id,
    }, { transaction });

    await CommitService.makeCommit(event.id, req.session.clientId, 'Hello!', { transaction });
  });

  res.status(201).json({
    message: '提交成功，该事件在社区管理员审核通过后将很快开放',
    event,
  });

  NotificationService.notifyWhenEventCreated(event, req.session.clientId);
  EventService.updateElasticsearchIndex({ event });
}

export default createEvent;
