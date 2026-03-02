import { Client } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService } from '@Services';

async function getClientList(req: RedstoneRequest, res: RedstoneResponse) {
  let page = 1;
  let whereStr;

  if (req.body && req.body.page) {
    page = req.body.page;
  } else if (req.query && req.query.page) {
    page = parseInt(req.query.page as string || '1');
  }

  if (req.body && req.body.where) {
    whereStr = req.body.where;
  } else if (req.query && req.query.where) {
    whereStr = req.query.where;
  }

  let where: any;
  if (whereStr) {
    try {
      where = typeof whereStr === 'string' ? JSON.parse(whereStr) : whereStr;
    } catch (err) {/* happy */}

    where = UtilService.convertWhereQuery(where);
  }

  const attributes = ['id', 'username'];
  const { rows, count } = await Client.findAndCountAll({
    where: where || {},
    order: [['updatedAt', 'DESC']],
    attributes,
    offset: (page - 1) * 10,
    limit: 10,
  });

  res.status(200).json({ clientList: rows, count });
}

export default getClientList;
