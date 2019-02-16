const { Op } = require('sequelize');
const _ = require('lodash');

function convertWhereQuery (where) {
  if (!where) return {};

  for (const key of Object.keys(where)) {
    if (key === 'contains') {
      where[Op.like] = `%${where[key]}%`;
      delete where.contains;
    } else if (key === 'or' && _.isArray(where[key])) {
      const or = where[key].map(w => convertWhereQuery(w));
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

module.exports = convertWhereQuery;
