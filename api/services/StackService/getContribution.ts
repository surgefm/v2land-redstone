import { Record, Client } from '@Models';
import { StackObj } from '@Types';
import * as ClientService from '@Services/ClientService';
import { Op, Transaction } from 'sequelize';

async function getContribution(stack: StackObj, withData = true, { transaction }: {
  transaction?: Transaction;
} = {}) {
  const attributes = ['model', 'target', 'operation', 'owner'];
  if (withData) {
    attributes.push('before');
    attributes.push('data');
  }

  const records = await Record.findAll({
    where: {
      action: {
        [Op.or]: ['createStack', 'invalidateStack', 'updateStackStatus', 'updateStackDetail'],
      },
      target: stack.id,
    },
    attributes,
    include: [{
      model: Client,
      as: 'ownedBy',
      attributes: ClientService.sanitizedFields,
    }],
    transaction,
  });

  return records;
}

export default getContribution;
