import { Op, Transaction } from 'sequelize';
import _ from 'lodash';
import { EventContributor, Commit, Record, Stack } from '@Models';
import * as UtilService from '../UtilService';

async function generateCommitContributionData(commit: Commit, { transaction }: { transaction?: Transaction } = {}) {
  let { parent } = commit;
  if (!parent && commit.parentId) {
    parent = await Commit.findByPk(commit.parentId);
  }

  const timeConstraint = {
    createdAt: {
      [Op.lte]: commit.time,
      ...(parent ? { [Op.gt]: parent.time } : null),
    },
  };

  await UtilService.execWithTransaction(async transaction => {
    const eventContributionRecords = await Record.findAll({
      where: {
        ...timeConstraint,
        id: commit.eventId,
        action: {
          [Op.or]: ['createEvent', 'addNewsToEvent', 'updateStackOrders'],
        },
      },
      transaction,
    });

    const stacks = await Stack.findAll({
      where: {
        eventId: commit.eventId,
        status: 'admitted',
        order: { [Op.gte]: 0 },
      },
      transaction,
    });

    const stackContributionRecords = await Record.findAll({
      where: {
        ...timeConstraint,
        target: { [Op.or]: stacks.map(s => s.id) },
        action: {
          [Op.or]: ['createStack', 'addNewsToStack'],
        },
      },
      transaction,
    });

    const roleChangeRecords = await Record.findAll({
      where: {
        ...timeConstraint,
        model: 'Client',
        action: {
          [Op.or]: [
            'setClientEventOwner',
            'allowClientToViewEvent',
            'allowClientToEditEvent',
            'allowClientToManageEvent',
            'disallowClientToViewEvent',
            'disallowClientToEditEvent',
            'disallowClientToManageEvent',
          ],
        },
      },
      transaction,
    });
    const roleChanges = _.uniqBy(roleChangeRecords, r => r.target);

    const records = [...eventContributionRecords, ...stackContributionRecords, ...roleChanges];
    records.sort((a, b) => {
      if (a.action === b.action) {
        return a.createdAt > b.createdAt ? 1 : -1;
      }
      return a.action > b.action ? 1 : -1;
    });
    const clientIds = _.uniq(records.map(r => r.owner));
    const clients: { [index: number]: Partial<EventContributor> } = {};
    for (const clientId of clientIds) {
      const data = {
        eventId: commit.eventId,
        commitId: commit.id,
        contributorId: clientId,
        points: 0,
        parentId: undefined as number,
      };
      if (commit.parentId) {
        const previousCount = await EventContributor.findOne({
          where: {
            eventId: commit.eventId,
            contributorId: clientId,
          },
          order: [['createdAt', 'DESC']],
          transaction,
        });
        if (previousCount) {
          data.parentId = previousCount.id;
          data.points = previousCount.points;
        }
      }
      clients[clientId] = data;
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const nextRecord = records[i + 1] || {} as Record;
      if (record.action === 'updateStackOrders' && nextRecord.action === 'updateStackOrders' && record.owner === nextRecord.owner) {
        continue;
      }
      switch (record.action) {
      case 'createEvent':
        clients[record.owner].points += 5;
        break;
      case 'addNewsToEvent':
        clients[record.owner].points += 2;
        break;
      case 'createStack':
        clients[record.owner].points += 2;
        break;
      case 'addNewsToStack':
        clients[record.owner].points += 1;
        break;
      case 'updateStackOrders':
        clients[record.owner].points += 1;
        break;
      case 'inviteClientToNewsroom':
        clients[record.owner].points += 1;
        break;
      }
    }

    for (const roleChange of roleChanges) {
      clients[roleChange.owner].points += 1;
    }

    for (const clientId of clientIds) {
      const eventContributor = await EventContributor.findOne({
        where: {
          eventId: commit.eventId,
          commitId: commit.id,
          clientId,
        },
        transaction,
      });
      if (eventContributor) {
        await eventContributor.update(clients[clientId], { transaction });
      } else {
        await EventContributor.create(clients[clientId], { transaction });
      }
    }
  }, transaction);
}

export default generateCommitContributionData;
