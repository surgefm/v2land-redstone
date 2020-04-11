import { Event, EventStackNews, HeaderImage, Stack, EventTag, Client, Commit } from '@Models';
import findEvent from './findEvent';
import generatePinyin from './generatePinyin';
import * as UtilService from '../UtilService';
import * as RecordService from '../RecordService';
import * as RedisService from '../RedisService';
import * as CommitService from '../CommitService';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import { Transaction } from 'sequelize';
import _ from 'lodash';

async function forkEvent(
  eventId: number,
  userId: Client | number,
  { transaction }: { transaction?: Transaction } = {},
) {
  const forkTime = new Date();
  const commit = await CommitService.getLatestCommit(eventId);

  if (!commit) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该事件：${eventId}`);
  }
  const event = commit.data;

  const user = userId instanceof Client
    ? userId as Client
    : await Client.findByPk(userId, { attributes: ['id'] });

  if (!user) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该用户：${eventId}`);
  }

  const existingEvent = await Event.findOne({
    where: {
      name: event.name,
      ownerId: user.id,
    },
    attributes: ['id'],
    transaction,
  });

  if (existingEvent) return null;
  let newEvent: Event;

  await UtilService.execWithTransaction(async transaction => {
    newEvent = await Event.create({
      name: event.name,
      pinyin: event.pinyin || await generatePinyin(event.name),
      description: event.description,
      latestAdmittedNewsId: event.latestAdmittedNewsId,
      status: 'hidden',
      parentId: event.id,
      ownerId: user.id,
    }, { transaction });

    if (event.headerImage) {
      await HeaderImage.create({
        ...event.headerImage,
        eventId: newEvent.id,
        id: undefined,
      }, { transaction });
    }

    const stackQueue = event.stacks.map(async stack => {
      const newStack = await Stack.create({
        ..._.pick(stack, ['title', 'description', 'status', 'order', 'time']),
        eventId: newEvent.id,
      }, { transaction });

      const esnData = stack.news.map(news => ({
        eventId: newEvent.id,
        stackId: newStack.id,
        newsId: news.id,
      }));
      await EventStackNews.bulkCreate(esnData, { transaction });
    });
    await Promise.all(stackQueue);

    const temporaryStackData = event.temporaryStack.map(news => ({
      eventId: newEvent.id,
      newsId: news.id,
    }));
    await EventStackNews.bulkCreate(temporaryStackData, { transaction });

    const tagData = event.tags.map(tag => ({
      eventId: newEvent.id,
      tagId: tag.id,
    }));
    await EventTag.bulkCreate(tagData, { transaction });

    const newEventData = await findEvent(newEvent.id, { transaction, plain: true });

    const summary = event.owner
      ? `Forked from ${event.owner.username}’s ${event.name} #${event.id}`
      : `Forked from ${event.name} #${event.id}`;

    const newCommit = await Commit.create({
      summary,
      data: newEventData,
      description: `${commit.summary}\n\n${commit.description}`,
      parentId: commit.id,
      authorId: user.id,
      eventId: newEvent.id,
      isForkCommit: true,
      diff: [],
      time: forkTime.toISOString().replace('T', ' ').replace('Z', ' +00:00'),
    }, { transaction });
    await RedisService.set(`commit-${newEvent.id}`, newCommit.get({ plain: true }));

    await RecordService.create({
      model: 'Event',
      action: 'forkEvent',
      target: event.id,
      subtarget: newEvent.id,
      owner: user.id,
      createdAt: forkTime,
      updatedAt: forkTime,
    }, { transaction });
  }, transaction);

  return newEvent;
}

export default forkEvent;
