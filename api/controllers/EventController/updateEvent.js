const SeqModels = require('../../../seqModels');

async function updateEvent (req, res) {
  const name = req.param('eventName');
  const event = await EventService.findEvent(name);

  if (!req.body) {
    return res.status(400).json({
      message: '缺少参数',
    });
  }

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const changes = {};
  for (const attribute of ['name', 'description', 'status']) {
    if (req.body[attribute] && req.body[attribute] !== event[attribute]) {
      changes[attribute] = req.body[attribute];
    }
  }

  if (Object.getOwnPropertyNames(changes).length === 0) {
    return res.status(200).json({
      message: '什么变化也没有发生',
      event,
    });
  }

  if (changes.name) {
    changes.pinyin = EventService.generatePinyin(changes.name);
  }

  try {
    await sequelize.transaction(async transaction => {
      const query = {
        model: 'Event',
        owner: req.session.clientId,
      };

      if (changes.status) {
        await SeqModels.Event.update({
          status: changes.status,
        }, {
          where: { id: event.id },
          transaction,
        });

        await RecordService.update({
          ...query,
          action: 'updateEventStatus',
          data: { status: changes.status },
          before: event.status,
          target: event.id,
        }, { transaction });
      }

      const selfClient = req.currentClient;
      NotificationService.notifyWhenEventStatusChanged(event, changes, selfClient);

      delete changes.status;
      const before = {};
      for (const i of Object.keys(changes)) {
        before[i] = event[i];
      }

      if (Object.keys(changes).length > 0) {
        await SeqModels.Event.update(changes, {
          where: { id: event.id },
          transaction,
        });

        await RecordService.update({
          ...query,
          action: 'updateEventDetail',
          data: changes,
          before,
          target: event.id,
        }, { transaction });
      }
    });

    res.status(201).json({
      message: '修改成功',
      event,
    });
  } catch (err) {
    return res.serverError(err);
  }
}

module.exports = updateEvent;
