const SeqModels = require('../../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function findEvent (eventName, { includes = {}, eventOnly = false, transaction } = {}) {
  const checkNewsIncluded = includes.stack && includes.news;
  let event = await SeqModels.Event.findOne({
    attributes: { exclude: ['pinyin'] },
    where: {
      [Op.or]: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    },
    include: eventOnly ? [] : [
      {
        model: SeqModels.HeaderImage,
        as: 'headerImage',
        required: false,
      }, {
        model: SeqModels.Stack,
        as: 'stacks',
        where: {
          status: 'admitted',
          order: { [Op.gte]: 0 },
        },
        order: [['order', 'DESC']],
        required: false,
        include: {
          model: SeqModels.News,
          as: 'news',
          where: { status: 'admitted' },
          order: [['time', 'ASC']],
          limit: 3,
          required: false,
        },
      },
    ],
    transaction,
  });

  if (!event) return;

  event = event.get({ plain: true });
  event.stacks = event.stacks || [];

  event.newsCount = await SeqModels.News.count({
    where: {
      eventId: event.id,
      status: 'admitted',
    },
  });

  event.stackCount = await SeqModels.Stack.count({
    where: {
      eventId: event.id,
      status: 'admitted',
    },
  });

  if (event.newsCount > 0) {
    event.temporaryStack = await SeqModels.News.findAll({
      where: {
        eventId: event.id,
        status: 'admitted',
        stackId: null,
        isInTemporaryStack: true,
      },
      order: [['time', 'DESC']],
      transaction,
    });

    event.lastUpdate = (await SeqModels.News.findOne({
      where: {
        eventId: event.id,
        status: 'admitted',
      },
      order: [['time', 'DESC']],
      transaction,
    })).time;
  }

  const queue = [];
  const getStackedNews = async (i) => {
    const stack = { ...event.stacks[i] };
    let newsExist;
    if (checkNewsIncluded && +includes.stack === stack.id) {
      newsExist = await SeqModels.News.count({
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
      stack.news = await SeqModels.News.find({
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

    stack.newsCount = await SeqModels.News.count({
      where: {
        stackId: stack.id,
        status: 'admitted',
      },
      transaction,
    });
    event.stacks[i] = stack;
  };
  for (let i = 0; i < event.stacks.length; i++) {
    queue.push(getStackedNews(i));
  }
  await Promise.all(queue);

  return event;
}

module.exports = findEvent;
