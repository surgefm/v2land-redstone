import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Event, HeaderImage, News, Tag, sequelize, Commit, Sequelize } from '@Models';
import { UtilService, EventService, AccessControlService, RedisService, StarService } from '@Services';
import _ from 'lodash';

async function getEventList(req: RedstoneRequest, res: RedstoneResponse) {
  let page: number;
  let where: any;
  let mode; // 0: latest updated; 1:
  let isEditors = false;
  let getLatest = req.query.latest === '1';

  switch (req.method) {
  case 'GET':
    page = req.query.page;
    // 0: oldest event first (by first stack);
    // 1: newest event first (by latest news)
    mode = req.query.mode;
    if (req.query.where && typeof req.query.where === 'string') {
      where = JSON.parse(where);
    } else if (req.query.status) {
      where = {
        status: req.query.status,
      };
    }
    break;
  case 'POST':
    // 兼容古老代码 POST 方法
    page = req.body.page;
    where = req.body.where;
    mode = req.body.mode;
    break;
  }

  page = UtilService.validateNumber(page, 1);
  mode = UtilService.validateNumber(mode, 0);

  if (_.isUndefined(page)) {
    return res.status(400).json({
      message: '参数有误：page',
    });
  }

  if (_.isUndefined(mode)) {
    return res.status(400).json({
      message: '参数有误：mode',
    });
  }

  const key = `event-list-query-${JSON.stringify(where)}-${page}`;

  await sequelize.transaction(async transaction => {
    if ((where || getLatest) && req.session && req.session.clientId) {
      isEditors = await AccessControlService.hasRole(req.session.clientId, AccessControlService.roles.editors)
        || await AccessControlService.hasRole(req.session.clientId, AccessControlService.roles.admins);
    }

    if (where && !isEditors) {
      where.status = 'admitted';
    }

    if (getLatest) {
      getLatest = isEditors;
    }

    if (where) {
      where = UtilService.convertWhereQuery(where);
    }

    where = (where && Object.keys(where).length > 0) ? where : { status: 'admitted' };

    if (getLatest) {
      const events = await Event.findAll({
        where,
        include: [{
          as: 'headerImage',
          model: HeaderImage,
          required: false,
        }, {
          as: 'latestAdmittedNews',
          model: News,
          required: false,
        }, {
          as: 'tags',
          model: Tag,
          where: { status: 'visible' },
          through: { attributes: [] },
          required: false,
        }],
        order: [
          [{ model: News, as: 'latestAdmittedNews' }, 'time', 'DESC'],
          ['updatedAt', 'DESC'],
        ],
        limit: 15,
        offset: 15 * (page - 1),
        transaction,
      });

      const eventObjs = events.map(e => e.toJSON());
      await EventService.acquireContributionsByEventList(eventObjs);

      res.status(200).json({ eventList: eventObjs });
    } else {
      const redisData = await RedisService.get(key);
      if (redisData) {
        return res.status(200).json({ eventList: redisData });
      }

      const whereQuery = UtilService.generateWhereQuery({ data: where });
      const whereClause = `WHERE ${whereQuery.query}`;

      const query = `
        SELECT *
        FROM (
          SELECT
            DISTINCT ON ("eventId") "eventId",
            (CASE WHEN "data"::json#>>'{stacks,0,time}' NOTNULL
              THEN "data"::json#>>'{stacks,0,time}'
            WHEN "data"::json#>>'{stacks,0,news,0}' NOTNULL
              THEN "data"::json#>>'{stacks,0,news,0,time}'
            WHEN "data"::json#>>'{latestAdmittedNews}' NOTNULL
              THEN "data"::json#>>'{latestAdmittedNews,time}'
              ELSE NULL
            END) as t,
            *
          FROM public.commit
          ${whereClause} AND time NOTNULL
          ORDER BY "eventId", "time" DESC
        ) as commit
        WHERE t NOTNULL
        ORDER BY t DESC
        LIMIT 15
        OFFSET ${15 * (page - 1)}
      `;

      const commits = await sequelize.query<Commit>(query, {
        transaction,
        type: Sequelize.QueryTypes.SELECT,
        bind: whereQuery.values,
      });
      for (const commit of commits) {
        delete commit.data.contribution;
        delete commit.data.stacks;
        commit.data.time = (commit as any).t;
      }
      await Promise.all(commits.map(async c => {
        c.data.starCount = await StarService.countStars(c.eventId);
        c.data.curations = await EventService.getCurations(c.eventId);
      }));
      const data = commits.map(c => c.data);
      res.status(200).json({ eventList: commits.map(c => c.data) });
      await RedisService.set(key, data);
      await RedisService.expire(key, 30);
    }
  });
}

export default getEventList;
