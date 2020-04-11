import { Commit, Client, sequelize } from '@Models';
import getLatestCommit from './getLatestCommit';
import * as EventService from '../EventService';
import * as RecordService from '../RecordService';
import * as RedisService from '../RedisService';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import { Transaction } from 'sequelize';
import _ from 'lodash';

async function makeCommit(
  eventId: number | string,
  authorId: Client | number,
  summary: string,
  { description, parent, transaction }: {
    description?: string;
    parent?: number;
    transaction?: Transaction;
  } = {},
) {
  const commitTime = new Date().toISOString().replace('T', ' ').replace('Z', ' +00:00');
  const eventObj = await EventService.findEvent(eventId as number | string, { transaction, plain: true });

  if (!eventObj) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该事件：${eventId}`);
  }

  const parentCommit = parent ? await Commit.findByPk(parent) : await getLatestCommit(eventObj.id);
  if (parentCommit) {
    delete parentCommit.data.commitTime;
    delete parentCommit.data.contribution;
    if (_.isEqual(parentCommit.data, convertDateToString(eventObj))) {
      // Event data didn't change.
      return;
    }
  }

  eventObj.contribution = await EventService.getContribution(eventObj, true);
  eventObj.commitTime = commitTime;

  const author = authorId instanceof Client
    ? authorId as Client
    : await Client.findByPk(authorId, { attributes: ['id'] });

  if (!author) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该用户：${eventId}`);
  }

  let commit: Commit;
  await execWithTransaction(async transaction => {
    commit = await Commit.create({
      authorId: author.id,
      eventId: eventObj.id,
      summary,
      description,
      time: commitTime,
      data: eventObj,
      diff: [],
      parentId: parentCommit ? parentCommit.id : null,
    }, { transaction });

    await RecordService.create({
      model: 'Event',
      target: eventObj.id,
      subtarget: commit.id,
      action: 'makeCommitForEvent',
    }, { transaction });
  }, transaction);

  await RedisService.set(`commit-${eventObj.id}`, commit.get({ plain: true }));
  return commit;
}

async function execWithTransaction(
  fn: (transaction: Transaction) => Promise<void>,
  transaction?: Transaction,
) {
  if (transaction) {
    return fn(transaction);
  } else {
    await sequelize.transaction(fn);
  }
}

function convertDateToString(o: { [index: string]: any }) {
  for (const key of Object.keys(o)) {
    if (o[key] instanceof Date) {
      o[key] = o[key].toISOString();
    } else if (_.isObject(o[key])) {
      o[key] = convertDateToString(o[key]);
    }
  }

  return o;
}

export default makeCommit;
