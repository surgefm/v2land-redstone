/* eslint-disable no-empty */
import { RedstoneRequest, RedstoneResponse, StackObj } from '@Types';
import { Client, News, EventNews, StackNews, sequelize } from '@Models';
import { EventService, RecordService, NewsService, NotificationService, StackService } from '@Services';
import axios from 'axios';
// const urlTrimmer = require('v2land-url-trimmer');

async function createNews (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const data = req.body;

  let client: Client;
  if (req.session.clientId) {
    client = await Client.findByPk(req.session.clientId);
  }

  for (const attr of ['url', 'source', 'abstract', 'time']) {
    if (!data[attr]) {
      return res.status(400).json({
        message: `缺少 ${attr} 参数`,
      });
    }
  }

  // data.url = (await urlTrimmer.trim(data.url)).toString();
  const event = await EventService.findEvent(name);
  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  let stack: StackObj;
  if (data.stackId) {
    stack = await StackService.findStack(data.stackId, false);
    if (!stack || stack.eventId != event.id) {
      return res.status(400).json({
        message: '未找到该进展或该进展不属于目标事件',
      });
    }
    data.stackId = stack.id;
  }

  data.status = 'pending';

  await sequelize.transaction(async transaction => {
    const existingNews = await News.findOne({
      where: { url: data.url },
      transaction,
    });
    if (existingNews) {
      return res.status(409).json({
        message: '审核队列或新闻合辑内已有相同链接的新闻',
      });
    }

    // Ask the Wayback Machine of Internet Archive to archive the webpage.
    try {
      axios.get(`https://web.archive.org/save/${data.url}`);
    } catch (err) {}

    const time = new Date();
    const news = await News.create({
      url: data.url,
      abstract: data.abstract,
      source: data.source,
      title: data.title,
      time: data.time,
      comment: data.comment,
    }, {
      raw: true,
      transaction,
    });

    await RecordService.create({
      model: 'News',
      data: news.get({ plain: true }),
      target: news.id,
      action: 'createNews',
      owner: req.session.clientId,
      createdAt: time,
    }, { transaction });

    // Add news to event
    const eventNews = await EventNews.create({
      eventId: event.id,
      newsId: news.id,
    }, { transaction });

    await RecordService.create({
      model: 'EventNews',
      data: eventNews,
      target: event.id,
      subtarget: news.id,
      action: 'addNewsToEvent',
      owner: req.session.clientId,
      createdAt: time,
    }, { transaction });

    // Add news to stack
    if (stack && stack.eventId === event.id) {
      const stackNews = await StackNews.create({
        stackId: stack.id,
        newsId: news.id,
      }, { transaction });

      await RecordService.create({
        model: 'StackNews',
        data: stackNews,
        target: stack.id,
        subtarget: news.id,
        action: 'addNewsToStack',
        owner: req.session.clientId,
        createdAt: time,
      }, { transaction });
    }

    res.status(201).json({
      message: '提交成功，该新闻在社区管理员审核通过后将很快开放',
      news,
    });

    NotificationService.notifyWhenNewsCreated(news, client);
    NewsService.updateElasticsearchIndex({ newsId: news.id });
  });
}

export default createNews;
