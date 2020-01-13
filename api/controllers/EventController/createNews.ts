import { RedstoneRequest, RedstoneResponse, sequelize } from '@Types';
import { Client, News } from '@Models';
import { EventService, RecordService, NewsService, NotificationService } from '@Services';
import axios from 'axios';
const urlTrimmer = require('v2land-url-trimmer');

async function createNews (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.param('eventName');
  const data = req.body;

  let client: Client;
  if (req.session.clientId) {
    client = await Client.findByPk(req.session.clientId);
  }

  for (const attr of ['url', 'source', 'abstract']) {
    if (!data[attr]) {
      return res.status(400).json({
        message: `缺少 ${attr} 参数`,
      });
    }
  }

  data.url = (await urlTrimmer.trim(data.url)).toString();
  const event = await EventService.findEvent(name);
  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  data.eventId = event.id;
  data.status = 'pending';

  await sequelize.transaction(async transaction => {
    const existingNews =
      await News.findOne({
        where: {
          url: data.url,
          eventId: event.id,
        },
        transaction,
      });
    if (existingNews) {
      return res.status(409).json({
        message: '审核队列或新闻合辑内已有相同链接的新闻',
      });
    }

    // Ask the Wayback Machine of Internet Archive to archive the webpage.
    axios.get(`https://web.archive.org/save/${data.url}`);

    const news = await News.create(data, {
      raw: true,
      transaction,
    });

    await RecordService.create({
      model: 'News',
      data,
      target: news.id,
      action: 'createNews',
      owner: req.session.clientId,
    }, { transaction });

    res.status(201).json({
      message: '提交成功，该新闻在社区管理员审核通过后将很快开放',
      news,
    });

    NotificationService.notifyWhenNewsCreated(news, client);
    NewsService.updateElasticsearchIndex({ newsId: news.id });
  });
}

export default createNews;
