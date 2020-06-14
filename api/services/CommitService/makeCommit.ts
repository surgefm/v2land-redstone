import { Commit, Client } from '@Models';
import getLatestCommit from './getLatestCommit';
import * as EventService from '../EventService';
import * as RecordService from '../RecordService';
import * as RedisService from '../RedisService';
import * as UtilService from '../UtilService';
import * as ContributionService from '../ContributionService';
import { RedstoneError, ResourceNotFoundErrorType, InvalidInputErrorType } from '@Types';
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
  const eventObj = await EventService.findEvent(eventId, { transaction, plain: true });

  if (!eventObj) {
    throw new RedstoneError(ResourceNotFoundErrorType, `未找到该时间线：${eventId}`);
  }

  for (const stack of eventObj.stacks || []) {
    if (stack.news.length === 0 && !stack.stackEventId) {
      throw new RedstoneError(InvalidInputErrorType, `时间线上的进展必须有至少一条过审新闻或时间线`);
    }
  }

  delete eventObj.owner;
  const parentCommit = parent ? await Commit.findByPk(parent) : await getLatestCommit(eventObj.id);
  if (parentCommit) {
    delete parentCommit.data.commitTime;
    delete parentCommit.data.contribution;
    delete parentCommit.data.owner;
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
  await UtilService.execWithTransaction(async transaction => {
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

    await ContributionService.generateCommitContributionData(commit, { transaction });
    commit.data = {
      ...commit.data,
      contributors: await EventService.getContributors(eventObj.id),
    };
    await commit.save({ transaction });

    await RecordService.create({
      model: 'Event',
      target: eventObj.id,
      subtarget: commit.id,
      action: 'makeCommitForEvent',
      owner: author.id,
    }, { transaction });
  }, transaction);

  await RedisService.set(`commit-${eventObj.id}`, commit.get({ plain: true }));
  return commit;
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
