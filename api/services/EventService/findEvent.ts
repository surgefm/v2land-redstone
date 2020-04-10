import { Event, HeaderImage, Stack, News, Tag, Sequelize } from '@Models';
import { EventObj } from '@Types';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';

interface FindEventOptions {
  eventOnly?: boolean;
  transaction?: Transaction;
  plain?: boolean;
}

async function findEvent (
  eventName: string | number,
  options?: FindEventOptions & { plain?: undefined | false },
): Promise<Event>;
async function findEvent (
  eventName: string | number,
  options: FindEventOptions & { plain: true },
): Promise<EventObj>;

async function findEvent (
  eventName: string | number,
  { eventOnly = false, plain = false, transaction }: FindEventOptions = {},
) {
  const event = await Event.findOne({
    attributes: {
      exclude: ['pinyin'],
      include: [[
        Sequelize.literal(`(
          SELECT COUNT(esn)
          FROM "eventStackNews" AS esn
          LEFT JOIN "stack" AS stack ON stack.id = esn."stackId"
          WHERE esn."eventId" = event.id AND stack.order >= 0
        )`),
        'stackCount',
      ]],
    },
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
        model: News,
        as: 'temporaryStack',
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
      },
    ],
    transaction,
  });

  if (!event) return;
  event.newsCount = 0;
  for (const stack of event.stacks) {
    event.newsCount += stack.newsCount;
  }

  if (plain) {
    return event.get({ plain: true }) as EventObj;
  } else {
    return event;
  }
}

export default findEvent;
