const pinyin = require('pinyin');

module.exports = {

  getEventList: async (mode, page, where) => {
    where = UtilService.generateWhereQuery(where, model='event');
    mode = Number(mode);
    page = Number(page);

    let sqlQuery;
    const sqlQueryOldestStack = `WITH MATCH AS ( SELECT event.id id FROM "public"."event" LEFT JOIN "public"."stack" ON event.id = stack.event WHERE ${where.query} AND stack.status = 'admitted' GROUP BY event.id ORDER BY min(stack."updatedAt") ASC)
    SELECT "event"."name", "event"."pinyin", "event"."description", "event"."status", "event"."id", "event"."createdAt", "event"."updatedAt", "__headerImage"."imageUrl" AS "headerImage___imageUrl", "__headerImage"."source" AS "headerImage___source", "__headerImage"."sourceUrl" AS "headerImage___sourceUrl", "__headerImage"."id" AS "headerImage___id", "__headerImage"."createdAt" AS "headerImage___createdAt", "__headerImage"."updatedAt" AS "headerImage___updatedAt", "__headerImage"."event" AS "headerImage___event"
    FROM "public"."event" RIGHT JOIN MATCH ON "event".id = MATCH.id LEFT OUTER JOIN "public"."headerimage" AS "__headerImage" ON "event"."headerImage" = "__headerImage"."id"
    WHERE "event"."id" IN (SELECT id FROM MATCH)
    OFFSET ${(page-1)*10}
    LIMIT 10;`;
    const sqlQueryNewestNews = `WITH MATCH AS ( SELECT event.id id FROM "public"."event" LEFT JOIN "public"."news" ON event.id = news.event WHERE ${where.query} AND news.status = 'admitted' GROUP BY event.id ORDER BY max(news."updatedAt") DESC)
    SELECT "event"."name", "event"."pinyin", "event"."description", "event"."status", "event"."id", "event"."createdAt", "event"."updatedAt", "__headerImage"."imageUrl" AS "headerImage___imageUrl", "__headerImage"."source" AS "headerImage___source", "__headerImage"."sourceUrl" AS "headerImage___sourceUrl", "__headerImage"."id" AS "headerImage___id", "__headerImage"."createdAt" AS "headerImage___createdAt", "__headerImage"."updatedAt" AS "headerImage___updatedAt", "__headerImage"."event" AS "headerImage___event"
    FROM "public"."event" RIGHT JOIN MATCH ON "event".id = MATCH.id LEFT OUTER JOIN "public"."headerimage" AS "__headerImage" ON "event"."headerImage" = "__headerImage"."id"
    WHERE "event"."id" IN (SELECT id FROM MATCH)
    OFFSET ${(page-1)*10}
    LIMIT 10;`;

    switch (mode) {
    case 0:
      sqlQuery = sqlQueryOldestStack;
      break;
    case 1:
      sqlQuery = sqlQueryNewestNews;
      break;
    default:
      return;
    }

    let events;
    try {
      const Promise = require('bluebird');

      const eventQueryAsync = Promise.promisify(Event.query);
      const response = await eventQueryAsync(sqlQuery, where.values);
      events = response.rows;

      // FIXME: any better way to populate?
      for (const event of events) {
        event.headerImage = {
          imageUrl: event.headerImage___imageUrl,
          source: event.headerImage___source,
          sourceUrl: event.headerImage___sourceUrl,
          id: event.headerImage___id,
          createdAt: event.headerImage___createdAt,
          updatedAt: event.headerImage___updatedAt,
          event: event.headerImage___event,
        };

        delete event.headerImage___imageUrl;
        delete event.headerImage___source;
        delete event.headerImage___sourceUrl;
        delete event.headerImage___id;
        delete event.headerImage___createdAt;
        delete event.headerImage___updatedAt;
        delete event.headerImage___event;
      }
    } catch (err) {
      throw err;
    }

    return events;
  },

  findEvent: async (eventName, { includes = {} } = {}) => {
    const checkNewsIncluded = includes.stack && includes.news;

    let event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    })
      .populate('stack', {
        where: {
          status: 'admitted',
          order: { '>': -1 },
        },
        sort: 'order DESC',
      })
      .populate('headerImage');

    if (event) {
      event = { ...event };
      event.newsCount = await News.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });

      event.stackCount = await Stack.count({
        where: {
          event: event.id,
          status: 'admitted',
        },
      });

      const queue = [];
      const getStackedNews = async (i) => {
        const stack = { ...event.stack[i] };
        let newsExist;
        if (checkNewsIncluded && +includes.stack === stack.id) {
          newsExist = await News.count({
            event: event.id,
            id: +includes.news,
            stack: stack.id,
            status: 'admitted',
          });
        }
        stack.news = await News.find({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
          sort: 'time ASC',
          ...(newsExist ? {} : { limit: 3 }),
        });
        if (!stack.time && stack.news.length) {
          stack.time = stack.news[0].time;
        }
        stack.newsCount = await News.count({
          where: {
            stack: stack.id,
            status: 'admitted',
          },
        });
        event.stack[i] = stack;
      };
      for (let i = 0; i < event.stack.length; i++) {
        queue.push(getStackedNews(i));
      }
      await Promise.all(queue);
    }

    return event;
  },

  getContribution: async (event, withData = true) => {
    const select = ['model', 'target', 'operation', 'client'];
    if (withData) {
      select.push('before');
      select.push('data');
    }

    let target = event.id;

    if (event.headerImage) {
      if (typeof event.headerImage === 'number') {
        target = [event.id, event.headerImage];
      } else {
        target = [event.id, event.headerImage.id];
      }
    }

    const records = await Record.find({
      action: ['createEvent', 'updateEventStatus', 'updateEventDetail', 'createEventHeaderImage', 'updateEventHeaderImage'],
      target,
      select,
    }).populate('client');

    for (const record of records) {
      if (record.client) {
        record.client = ClientService.sanitizeClient(record.client);
      }
    }

    return records;
  },

  getContributionByList: async (eventList) => {
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
