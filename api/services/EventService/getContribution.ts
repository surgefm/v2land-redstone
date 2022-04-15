import { Client, Record } from '@Models';
import { SimplifiedEventInterface } from '@Types';
import * as ClientService from '@Services/ClientService';
import { Op } from 'sequelize';

async function getContribution(event: SimplifiedEventInterface, withData = true) {
  const attributes = ['model', 'target', 'operation', 'owner'];
  if (withData) {
    attributes.push('before');
    attributes.push('data');
  }

  const records = await Record.findAll({
    attributes,
    where: {
      [Op.or]: [{
        action: {
          [Op.or]: ['createEvent', 'updateEventStatus', 'updateEventDetail'],
        },
        target: event.id,
      },
      event.headerImage ? {
        action: {
          [Op.or]: ['createEventHeaderImage', 'updateEventHeaderImage'],
        },
        target: typeof event.headerImage === 'number'
          ? event.headerImage
          : event.headerImage.id,
      } : undefined],
    },
    include: [{
      model: Client,
      attributes: ClientService.sanitizedFields,
      required: false,
    }],
    order: [['updatedAt', 'DESC']],
  });

  return records;
}

export default getContribution;
