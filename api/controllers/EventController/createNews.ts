/* eslint-disable no-empty */
import { RedstoneRequest, RedstoneResponse, StackObj } from '@Types';
import { Client, News, EventStackNews, sequelize } from '@Models';
import { EventService, RecordService, NewsService, NotificationService, StackService } from '@Services';
import axios from 'axios';
// const urlTrimmer = require('v2land-url-trimmer');

async function createNews(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const data = req.body;

  let client: Client;
  if (req.session.clientId) {
    client = await Client.findByPk(req.session.clientId);
  }

  for (const attr of ['url', 'source', 'title', 'time']) {
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
      return res.status(404).json({
        message: '未找到该进展或该进展不属于目标事件',
      });
    }
  }

  data.status = 'admitted';

  await sequelize.transaction(async transaction => {
    let news = await News.findOne({
      where: { url: data.url },
      transaction,
    });
    if (news) {
      const existingRelation = await EventStackNews.findOne({
        where: {
          eventId: event.id,
          newsId: news.id,
        },
      });
      if (existingRelation) {
        return res.status(409).json({
          message: '审核队列或新闻合辑内已有相同链接的新闻',
        });
      }
    }

    // Ask the Wayback Machine of Internet Archive to archive the webpage.
    try {
      await axios.get(`https://web.archive.org/save/${data.url}`);
    } catch (err) {}

    const time = new Date();
    if (!news) {
      news = await News.create({
        url: data.url,
        abstract: data.abstract,
        source: data.source,
        title: data.title,
        time: data.time,
        comment: data.comment,
        status: 'admitted',
      }, {
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
    }

    // Add news to event and stack
    const eventNews = await EventStackNews.create({
      eventId: event.id,
      stackId: stack ? stack.id : undefined,
      newsId: news.id,
    }, { transaction });

    await RecordService.create({
      model: 'EventStackNews',
      data: eventNews,
      target: event.id,
      subtarget: news.id,
      action: 'addNewsToEvent',
      owner: req.session.clientId,
      createdAt: time,
    }, { transaction });

    // Add news to stack
    if (stack) {
      await RecordService.create({
        model: 'EventStackNews',
        data: eventNews,
        target: stack.id,
        subtarget: news.id,
        action: 'addNewsToStack',
        owner: req.session.clientId,
        createdAt: time,
      }, { transaction });
    }

    res.status(201).json({
      message: '提交成功',
      news,
    });

    try {
      await NotificationService.notifyWhenNewsCreated(news, client);
    } catch (err) {}
    try {
      await NewsService.updateElasticsearchIndex({ newsId: news.id });
    } catch (err) {}
  });
}

export default createNews;
