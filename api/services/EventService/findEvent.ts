import { Event, HeaderImage, Stack, News } from '@Models';
import { EventObj } from '@Types';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';

async function findEvent (
  eventName: string | number,
  { includes = {}, eventOnly = false, transaction }: {
    includes?: { stack?: number; news?: number };
    eventOnly?: boolean;
    transaction?: Transaction;
  } = {}) {
  const checkNewsIncluded = includes.stack && includes.news;
  const event = await Event.findOne({
    attributes: { exclude: ['pinyin'] },
    where: {
      [Op.or]: [
        { id: _.isNaN(+eventName) ? -1 : +eventName },
        { name: _.isNaN(+eventName) ? eventName : '' },
      ],
    },
    include: eventOnly ? [] : [
      {
        model: HeaderImage,
        as: 'headerImage',
        required: false,
      }, {
        model: Stack,
        as: 'stacks',
        where: {
          status: 'admitted',
          order: { [Op.gte]: 0 },
        },
        order: [['order', 'DESC']],
        required: false,
        include: [{
          model: News,
          as: 'news',
          where: { status: 'admitted' },
          order: [['time', 'ASC']],
          limit: 3,
          required: false,
        }],
      },
    ],
    transaction,
  });

  if (!event) return;

  const eventObj: EventObj = event.get({ plain: true }) as EventObj;
  eventObj.stacks = eventObj.stacks || [];

  eventObj.newsCount = await News.count({
    where: {
      eventId: event.id,
      status: 'admitted',
    },
  });

  eventObj.stackCount = await Stack.count({
    where: {
      eventId: event.id,
      status: 'admitted',
    },
  });

  if (eventObj.newsCount > 0) {
    eventObj.temporaryStack = await News.findAll({
      where: {
        eventId: event.id,
        status: 'admitted',
        stackId: null,
        isInTemporaryStack: true,
      },
      order: [['time', 'DESC']],
      transaction,
    });

    eventObj.lastUpdate = (await News.findOne({
      where: {
        eventId: event.id,
        status: 'admitted',
      },
      order: [['time', 'DESC']],
      transaction,
    })).time;
  }

  const queue = [];
  const getStackedNews = async (i: number) => {
    const stack = { ...eventObj.stacks[i] };
    let newsExist;
    if (checkNewsIncluded && +includes.stack === stack.id) {
      newsExist = await News.count({
        where: {
          eventId: event.id,
          id: +includes.news,
          stackId: stack.id,
          status: 'admitted',
        },
        transaction,
      });
    }

    if (newsExist) {
      stack.news = await News.findAll({
        where: {
          stackId: stack.id,
          status: 'admitted',
        },
        order: [['time', 'ASC']],
        transaction,
      });
    }

    if (!stack.time && stack.news.length) {
      stack.time = stack.news[0].time;
    }

    stack.newsCount = await News.count({
      where: {
        stackId: stack.id,
        status: 'admitted',
      },
      transaction,
    });
    eventObj.stacks[i] = stack;
  };
  for (let i = 0; i < eventObj.stacks.length; i++) {
    queue.push(getStackedNews(i));
  }
  await Promise.all(queue);

  return eventObj;
}

export default findEvent;
