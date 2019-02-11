const SeqModels = require('../../../seqModels');
const isUrl = require('../../../utils/urlValidator');

async function updateHeaderImage (req, res) {
  const name = req.param('eventName');
  const event = await EventService.findEvent(name);

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  if (!req.body.imageUrl) {
    return res.status(400).json({
      message: '缺少参数：imageUrl。',
    });
  }

  if (req.method === 'PUT' && !event.headerImage) {
    return res.status(400).json({
      message: '未找到该题图，请改用 POST 方法请求创建',
    });
  }

  if (req.method === 'POST' && event.headerImage) {
    return res.status(400).json({
      message: '该事件已有题图，请改用 PUT 方法请求修改',
    });
  }

  const headerImage = { eventId: event.id };

  for (const attribute of ['imageUrl', 'source', 'sourceUrl']) {
    if (req.body[attribute]) {
      headerImage[attribute] = req.body[attribute];
    }
  }

  if (headerImage.sourceUrl && !isUrl(headerImage.sourceUrl)) {
    return res.status(400).json({
      message: '链接格式不规范',
    });
  }

  try {
    const query = {
      model: 'HeaderImage',
      owner: req.session.clientId,
      data: headerImage,
    };

    await sequelize.transaction(async transaction => {
      if (req.method === 'PUT') {
        await SeqModels.HeaderImage.upsert(headerImage, {
          where: { id: event.headerImage.id },
          transaction,
        });
        await RecordService.update({
          ...query,
          action: 'updateEventHeaderImage',
          target: headerImage.id,
          before: event.headerImage,
        }, { transaction });
      } else {
        await SeqModels.HeaderImage.create({
          ...headerImage,
          eventId: event.id,
        }, { transaction });
        await RecordService.create({
          ...query,
          action: 'createEventHeaderImage',
        }, { transaction });
      }
    });
  } catch (err) {
    return res.serverError(err);
  }

  res.status(201).json({
    message: event.headerImage ? '修改成功' : '添加成功',
    headerImage,
  });

  EventService.updateElasticsearchIndex({ eventId: event.id });
}

module.exports = updateHeaderImage;
