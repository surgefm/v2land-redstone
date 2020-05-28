import { Op } from 'sequelize';
import _ from 'lodash';

function convertWhereQuery(where: any) {
  if (!where) return {};

  for (const key of Object.keys(where)) {
    if (key === 'startsWith') {
      where[Op.iLike] = `${where[key]}%`;
      delete where.startsWith;
    } else if (key === 'endsWith') {
      where[Op.iLike] = `%${where[key]}`;
      delete where.endsWith;
    } else if (key === 'contains') {
      where[Op.iLike] = `%${where[key]}%`;
      delete where.contains;
    } else if (key === 'or' && _.isArray(where[key])) {
      const or = where[key].map((w: any) => convertWhereQuery(w));
      where[Op.or] = or;
      delete where.or;
    } else if (_.isArray(where[key])) {
      where[key] = { [Op.in]: where[key] };
    } else if (_.isPlainObject(where[key])) {
      where[key] = convertWhereQuery(where[key]);
    }
  }

  return where;
}

export default convertWhereQuery;
