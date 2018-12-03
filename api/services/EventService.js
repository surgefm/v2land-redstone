const SeqModels = require('../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const pinyin = require('pinyin');

const Mode1Sql = `
WITH MATCH AS (
    SELECT
        event.id id
    FROM
        "public"."event"
    LEFT JOIN "public"."stack" ON event.id = stack.event

    AND stack.status = 'admitted'
GROUP BY
    event.id
ORDER BY
    min(stack. "updatedAt") ASC
)
SELECT
    "event"."name",
    "event"."pinyin",
    "event"."description",
    "event"."status",
    "event"."id",
    "event"."createdAt",
    "event"."updatedAt",
    "headerImage"."imageUrl" AS "headerImage.imageUrl",
    "headerImage"."source" AS "headerImage.source",
    "headerImage"."sourceUrl" AS "headerImage.sourceUrl",
    "headerImage"."id" AS "headerImage.id",
    "headerImage"."createdAt" AS "headerImage.createdAt",
    "headerImage"."updatedAt" AS "headerImage.updatedAt",
    "headerImage"."event" AS "headerImage.event"
FROM
    "public"."event"
    RIGHT JOIN MATCH ON "event".id = MATCH.id
    LEFT OUTER JOIN "public"."headerimage" AS "headerImage" ON "event"."id" = "headerImage"."eventId"
WHERE
    "event"."id" IN (
        SELECT
            id
        FROM
            MATCH) OFFSET 0
    LIMIT 10
`;

module.exports = {

  getEventList: async ({ mode, page, where, transaction }) => {
    mode = Number(mode);
    page = Number(page);

    // FIXME: @Xiaoxing
    // let sqlQuery;
    // const sqlQueryOldestStack = `WITH MATCH AS ( SELECT event.id id FROM "public"."event" LEFT JOIN "public"."stack" ON event.id = stack.event WHERE ${where.query} AND stack.status = 'admitted' GROUP BY event.id ORDER BY min(stack."updatedAt") ASC)
    // SELECT "event"."name", "event"."pinyin", "event"."description", "event"."status", "event"."id", "event"."createdAt", "event"."updatedAt", "__headerImage"."imageUrl" AS "headerImage___imageUrl", "__headerImage"."source" AS "headerImage___source", "__headerImage"."sourceUrl" AS "headerImage___sourceUrl", "__headerImage"."id" AS "headerImage___id", "__headerImage"."createdAt" AS "headerImage___createdAt", "__headerImage"."updatedAt" AS "headerImage___updatedAt", "__headerImage"."event" AS "headerImage___event"
    // FROM "public"."event" RIGHT JOIN MATCH ON "event".id = MATCH.id LEFT OUTER JOIN "public"."headerimage" AS "__headerImage" ON "event"."headerImage" = "__headerImage"."id"
    // WHERE "event"."id" IN (SELECT id FROM MATCH)
    // OFFSET ${(page-1)*10}
    // LIMIT 10;`;
    // const sqlQueryNewestNews = `WITH MATCH AS ( SELECT event.id id FROM "public"."event" LEFT JOIN "public"."news" ON event.id = news.event WHERE ${where.query} AND news.status = 'admitted' GROUP BY event.id ORDER BY max(news."updatedAt") DESC)
    // SELECT "event"."name", "event"."pinyin", "event"."description", "event"."status", "event"."id", "event"."createdAt", "event"."updatedAt", "__headerImage"."imageUrl" AS "headerImage___imageUrl", "__headerImage"."source" AS "headerImage___source", "__headerImage"."sourceUrl" AS "headerImage___sourceUrl", "__headerImage"."id" AS "headerImage___id", "__headerImage"."createdAt" AS "headerImage___createdAt", "__headerImage"."updatedAt" AS "headerImage___updatedAt", "__headerImage"."event" AS "headerImage___event"
    // FROM "public"."event" RIGHT JOIN MATCH ON "event".id = MATCH.id LEFT OUTER JOIN "public"."headerimage" AS "__headerImage" ON "event"."headerImage" = "__headerImage"."id"
    // WHERE "event"."id" IN (SELECT id FROM MATCH)
    // OFFSET ${(page-1)*10}
    // LIMIT 10;`;

    // let order;

    // switch (mode) {
    // case 0:
    //   break;
    // case 1:
    //   // FIXME: different from mode 1
    //   break;
    // default:
    //   throw new TypeError('mode muse be 0 or 1');
    // }

    const events = await global.sequelize.query(Mode1Sql, {
      raw: true,
      transaction,
    });

    return events.toJSON();
  },

  findEvent: async (eventName, { includes = {}, eventOnly = false, transaction } = {}) => {
    const checkNewsIncluded = includes.stack && includes.news;
    const event = await SeqModels.Event.findOne({
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

    event.stacks = event.stacks || [];

    event.newsCount = await SeqModels.News.count({
      where: {
        eventId: event.id,
        status: 'admitted',
      },
      transaction,
    });

    event.stackCount = await SeqModels.Stack.count({
      where: {
        eventId: event.id,
        status: 'admitted',
      },
      transaction,
    });

    if (event.newsCount > 0) {
      event.lastUpdate = (await SeqModels.News.findOne({
        where: {
          eventId: event.id,
          status: 'admitted',
        },
        order: [['time', 'DESC']],
        transaction,
      })).time;

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
  },

  getContribution: async (event, withData = true) => {
    const attributes = ['model', 'target', 'operation', 'owner'];
    if (withData) {
      attributes.push('before');
      attributes.push('data');
    }

    const records = await SeqModels.Record.findAll({
      attributes,
      where: {
        [Op.or]: [{
          action: {
            [Op.or]: ['createEvent', 'updateEventStatus', 'updateEventDetail'],
          },
          target: event.id,
        },
        event.headerImage ? {
          action: {
            [Op.or]: ['createEventHeaderImage', 'updateEventHeaderImage'],
          },
          target: typeof event.headerImage === 'number'
            ? event.headerImage
            : event.headerImage.id,
        } : undefined],
      },
      include: [{
        model: SeqModels.Client,
        attributes: ['username', 'role', 'id'],
      }],
      order: [['updatedAt', 'DESC']],
    });

    return records;
  },

  acquireContributionsByEventList: async (eventList) => {
    const queue = [];

    const getCon = async (event) => {
      event.contribution = await EventService.getContribution(event);
    };

    if (eventList) {
      for (const event of eventList) {
        queue.push(getCon(event));
      }
    }

    await Promise.all(queue);
    return eventList;
  },

  generatePinyin: (name) => {
    const array = pinyin(name, {
      segment: false,
      style: 0,
    });

    const characters = [];
    for (let i = 0; i < 9; i++) {
      if (!array[i]) break;
      if (/^[a-z]*$/.test(array[i])) {
        characters.push(array[i]);
      }
    }

    return characters.length > 1
      ? characters.join('-')
      : null;
  },

};
