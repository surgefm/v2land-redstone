import { Event, HeaderImage, Stack, News, Tag, Sequelize, Client, Site, SiteAccount } from '@Models';
import { EventObj } from '@Types';
import * as AccessControlService from '@Services/AccessControlService';
import { Op, Transaction } from 'sequelize';
import _ from 'lodash';
import getContributors from './getContributors';

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

  if (eventOnly) {
    const event = await Event.findOne({
      where,
      include: [{
        model: HeaderImage,
        as: 'headerImage',
        required: false,
      }],
      transaction,
    });
    if (!event) return;
    if (plain) return event.get({ plain });
    return event;
  }

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
    include: [
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
          include: [{
            model: Site,
            as: 'site',
            required: false,
          }, {
            model: SiteAccount,
            as: 'siteAccount',
            required: false,
          }],
        }, {
          model: Event,
          as: 'stackEvent',
          where: { status: 'admitted' },
          required: false,
          include: [{
            model: HeaderImage,
            as: 'headerImage',
            required: false,
          }],
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

  const [roles, contributors] = await Promise.all([
    AccessControlService.getEventClients(event.id),
    getContributors(event.id, { transaction }),
  ]);
  event.roles = roles;
  event.contributors = contributors;

  event.stackCount = +event.stackCount;
  event.newsCount = 0;
  (event.offshelfNews as News[]).sort((a, b) => (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  (event.stacks as Stack[]).sort((a, b) => b.order - a.order);

  for (const stack of event.stacks) {
    stack.newsCount = +stack.newsCount;
    event.newsCount += stack.newsCount;
    (stack.news as News[]).sort((a, b) => (new Date(a.time).getTime() - new Date(b.time).getTime()));
  }

  return event;
}

export default findEvent;
