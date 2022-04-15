import { Tag, Event, Client } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService, AccessControlService, ClientService } from '@Services';

async function getTagList(req: RedstoneRequest, res: RedstoneResponse) {
  const where = req.body.where || { status: 'visible' };
  if (where.status !== 'visible') {
    if (!req.session.clientId) {
      where.status = 'visible';
    } else {
      const isEditor = await AccessControlService.isClientEditor(req.session.clientId);
      if (!isEditor) {
        where.status = 'visible';
      }
    }
  }

  const tags = await Tag.findAll({
    where: UtilService.convertWhereQuery(where),
    include: [{
      model: Event,
      as: 'events',
      where: { status: 'admitted' },
      through: { attributes: [] },
    }, {
      model: Client,
      as: 'curators',
      through: { attributes: [] },
      required: false,
      attributes: ClientService.sanitizedFields,
    }],
    order: [['updatedAt', 'DESC']],
    limit: 15,
    offset: 15 * (+req.query.page || req.body.page || 1) - 15,
  });

  res.status(200).json({ tags });
}

export default getTagList;
