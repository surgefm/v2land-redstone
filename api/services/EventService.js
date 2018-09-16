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
    LEFT OUTER JOIN "public"."headerimage" AS "headerImage" ON "event"."headerImage" = "headerImage"."id"
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

  findEvent: async (eventName, { includes = {} } = {}) => {
    const checkNewsIncluded = includes.stack && includes.news;
    const event = await SeqModels.Event.findOne({
      where: {
        [Op.or]: [
          { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
          { name: eventName },
        ],
      },
    });

    event.headerImage = await event.getHeaderImage();
    event.stacks = await event.getStacks({
      where: {
        status: 'admitted',
        order: { [Op.gte]: 0 },
      },
      order: [['order', 'DESC']],
    });

    if (event) {
      event.newsCount = await SeqModels.News.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });

      event.stackCount = await SeqModels.Stack.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });

      const queue = [];
      const getStackedNews = async (i) => {
        const stack = { ...event.stacks[i] };
        let newsExist;
        if (checkNewsIncluded && +includes.stack === stack.id) {
          newsExist = await SeqModels.News.count({
            where: {
              event: event.id,
              id: +includes.news,
              stack: stack.id,
              status: 'admitted',
            },
          });
        }
        stack.news = await SeqModels.News.find({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
          order: [['time', 'ASC']],
          ...(newsExist ? {} : { limit: 3 }),
        });
        if (!stack.time && stack.news.length) {
          stack.time = stack.news[0].time;
        }
        stack.newsCount = await SeqModels.News.count({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
        });
        event.stacks[i] = stack;
      };
      for (let i = 0; i < event.stacks.length; i++) {
        queue.push(getStackedNews(i));
      }
      await Promise.all(queue);
    }

    return event;
  },

  getContribution: async (event, withData = true) => {
    const attributes = ['model', 'target', 'operation', 'client'];
    if (withData) {
      attributes.push('before');
      attributes.push('data');
    }

    let records = await SeqModels.Record.findAll({
      attributes,
      where: {
        action: {
          [Op.or]: ['createEvent', 'updateEventStatus', 'updateEventDetail'],
        },
        target: event.id,
      },
      include: [{ model: SeqModels.Client }],
    });

    if (event.headerImage) {
      const headerImageRecords = await SeqModels.Record.findAll({
        attributes,
        where: {
          action: {
            [Op.or]: ['createEventHeaderImage', 'updateEventHeaderImage'],
          },
          target: typeof event.headerImage === 'number'
            ? event.headerImage
            : event.headerImage.id,
        },
        include: [{ model: SeqModels.Client }],
      });

      records = records.concat[headerImageRecords];
      records.sort((a, b) => a.updatedAt - b.updatedAt);
    }

    for (const record of records) {
      if (record.client) {
        record.client = ClientService.sanitizeClient(record.client);
      }
    }

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
