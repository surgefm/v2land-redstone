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
        [Op.or]: [
          {
            target: commit.eventId,
            action: {
              [Op.or]: ['createEvent', 'addNewsToEvent', 'updateStackOrders'],
            },
          },
          {
            subtarget: commit.eventId,
            action: 'forkEvent',
          },
        ],
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
        target: { [Op.or]: stacks.length > 0 ? stacks.map(s => s.id) : [-1] },
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
    const clientIds = _.uniq(records.map(r => r.owner).filter(i => i));
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
        let { parentId } = commit;
        while (parentId) {
          const previousCount = await EventContributor.findOne({
            where: {
              eventId: commit.eventId,
              contributorId: clientId,
              commitId: parentId,
            },
            transaction,
          });
          if (previousCount) {
            data.parentId = previousCount.id;
            data.points = previousCount.points;
            break;
          }
          const parentCommit = await Commit.findByPk(parentId, { transaction });
          parentId = parentCommit.parentId;
        }
      }
      clients[clientId] = data;
    }

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      if (!record.owner) continue;
      const nextRecord = records[i + 1];
      if (nextRecord && record.action === 'updateStackOrders' && nextRecord.action === 'updateStackOrders' && record.owner === nextRecord.owner) {
        continue;
      }
      switch (record.action) {
      case 'createEvent':
      case 'forkEvent':
        clients[record.owner].points += 5;
        break;
      case 'addNewsToEvent':
        clients[record.owner].points += 2;
        clients[record.owner].points += 2;
        break;
      case 'addNewsToStack':
      case 'updateStackOrders':
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
          contributorId: clientId,
        },
        transaction,
      });
      if (eventContributor) {
        eventContributor.points = clients[clientId].points;
        await eventContributor.save({ transaction });
      } else {
        await EventContributor.create(clients[clientId], { transaction });
      }
    }
  }, transaction);
}

export default generateCommitContributionData;
