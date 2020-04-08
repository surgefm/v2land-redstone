import { Event, HeaderImage, Stack, News, Tag } from '@Models';
import { EventObj } from '@Types';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';

async function findEvent (
  eventName: string | number,
  { eventOnly = false, transaction }: {
    includes?: { stack?: number; news?: number };
    eventOnly?: boolean;
    transaction?: Transaction;
  } = {}) {
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
          through: { attributes: [] },
          required: false,
        }],
      }, {
        model: News,
        as: 'latestAdmittedNews',
        required: false,
      }, {
        model: Tag,
        as: 'tags',
        where: { status: 'visible' },
        through: { attributes: [] },
        required: false,
      },
    ],
    transaction,
  });

  if (!event) return;

  const eventObj: EventObj = event.get({ plain: true }) as EventObj;
  eventObj.stacks = eventObj.stacks || [];

  eventObj.newsCount = await event.$count('news', {
    where: { status: 'admitted' },
    transaction,
  });

  eventObj.stackCount = await Stack.count({
    where: {
      eventId: event.id,
      status: 'admitted',
    },
    transaction,
  });

  if (eventObj.newsCount > 0) {
    eventObj.temporaryStack = await event.$get('news', {
      where: {
        status: 'admitted',
        isInTemporaryStack: true,
      },
      order: [['time', 'DESC']],
      transaction,
    });

    if (event.latestAdmittedNews) {
      eventObj.lastUpdate = event.latestAdmittedNews.time;
    }
  }

  const queue = [];
  const getStackedNews = async (i: number) => {
    const stack = { ...eventObj.stacks[i] };
    if (!stack.time && stack.news.length) {
      stack.time = stack.news[0].time;
    }

    stack.newsCount = stack.news.length;
    eventObj.stacks[i] = stack;
  };

  for (let i = 0; i < eventObj.stacks.length; i++) {
    queue.push(getStackedNews(i));
  }
  await Promise.all(queue);

  return eventObj;
}

export default findEvent;
