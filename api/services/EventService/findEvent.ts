import { Event, HeaderImage, Stack, News, Tag, Sequelize, Client, Record } from '@Models';
import { EventObj } from '@Types';
import * as AccessControlService from '@Services/AccessControlService';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';

interface FindEventOptions {
  eventOnly?: boolean;
  transaction?: Transaction;
  getNewsroomContent?: boolean;
  plain?: boolean;
}

async function findEvent(
  eventName: string | number,
  options?: FindEventOptions & { plain?: undefined | false },
): Promise<Event>;
async function findEvent(
  eventName: string | number,
  options: FindEventOptions & { plain: true },
): Promise<EventObj>;

async function findEvent(
  eventName: string | number,
  { eventOnly = false, plain = false, getNewsroomContent = false, transaction }: FindEventOptions = {},
) {
  const where = _.isNaN(+eventName) ? { name: eventName } : { id: eventName };

  let event: Event | EventObj = await Event.findOne({
    attributes: {
      include: [[
        Sequelize.literal(`(
          SELECT COUNT(stack)
          FROM "stack" AS stack
          WHERE stack."eventId" = event.id AND stack.order >= 0 AND stack.status = 'admitted'
        )`),
        'stackCount',
      ]],
    },
    where,
    include: eventOnly ? [] : [
      {
        model: HeaderImage,
        as: 'headerImage',
        required: false,
      }, {
        model: News,
        as: 'offshelfNews',
        where: {
          id: {
            [Op.in]: Sequelize.literal(`(
              SELECT esn."newsId"
              FROM "eventStackNews" AS esn
              LEFT JOIN news as news ON esn."newsId" = news.id
              WHERE news.status = 'admitted' AND esn."stackId" IS NULL
            )`),
          },
        },
        order: [['time', 'DESC']],
        through: { attributes: [] },
        required: false,
      }, {
        model: Stack,
        as: 'stacks',
        where: {
          status: 'admitted',
          ...(getNewsroomContent ? {} : { order: { [Op.gte]: 0 } }),
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
        attributes: {
          include: [[
            Sequelize.literal(`(
              SELECT COUNT(esn)
              FROM "eventStackNews" AS esn
              LEFT JOIN "news" AS news ON news.id = esn."newsId"
              WHERE esn."stackId" = stacks.id AND news.status = 'admitted'
            )`),
            'newsCount',
          ]],
        },
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
      }, {
        model: Client,
        as: 'owner',
        attributes: ['id', 'username', 'nickname', 'avatar', 'description'],
        required: false,
      },
    ],
    transaction,
  });

  if (!event) return;

  if (plain) event = event.get({ plain }) as EventObj;

  if (!eventOnly) {
    event.roles = await AccessControlService.getEventClients(event.id);
    event.stackCount = +event.stackCount;
    event.newsCount = 0;
    (event.offshelfNews as News[]).sort((a, b) => (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    (event.stacks as Stack[]).sort((a, b) => b.order - a.order);

    for (const stack of event.stacks) {
      stack.newsCount = +stack.newsCount;
      event.newsCount += stack.newsCount;
      (stack.news as News[]).sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));
    }

    const contributionCount: { [index: number]: number } = {};
    const records = await Record.findAll({
      where: {
        model: { [Op.or]: ['Event', 'EventStackNews'] },
        target: event.id,
      },
      transaction,
    });
    for (const record of records) {
      contributionCount[record.owner] = (contributionCount[record.owner] || 0) + 1;
    }
    ((event.stacks || []) as Stack[]).map(async stack => {
      const stackRecords = await Record.findAll({
        where: {
          model: { [Op.or]: ['Stack', 'EventStackNews'] },
          target: stack.id,
        },
        transaction,
      });
      for (const record of stackRecords) {
        contributionCount[record.owner] = (contributionCount[record.owner] || 0) + 1;
      }
    });

    const contributorIdList = Object.keys(contributionCount).filter(id => id !== 'null');
    contributorIdList.sort((a, b) => contributionCount[+a] - contributionCount[+b]);
    event.contributorIdList = contributorIdList.map(id => +id);
  }

  return event;
}

export default findEvent;
