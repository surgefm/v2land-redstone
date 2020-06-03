/**
 * 生成 WHERE 语句
 */
import { Op } from 'sequelize';

const { iLike } = Op;

function generateWhereQuery(query: any, model = '', values: any[] = [], parents: any[] = []) {
  let string = '';
  const properties = Object.getOwnPropertyNames(query);
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    let temp = parents.slice();
    if (
      !query[property] ||
      [
        '_properties',
        'associations',
        'associationsCache',
        'inspect',
        'add',
        'remove',
      ].includes(property)
    ) {
      continue;
    } else if (
      typeof query[property] !== 'object' ||
      query[property] instanceof Date ||
      query[property][iLike]
    ) {
      if (string.length) {
        string += ' AND ';
      }
      if (temp.length > 0) {
        string += `"${temp[0]}"::json#>>'{`;
        temp = temp.slice(1);
        temp.push(property);
        string += `${temp.join(',')}}'`;
      } else {
        string += (model ? (model + '.') : '') + property;
      }

      if (typeof query[property] !== 'object' || query[property] instanceof Date) {
        values.push(query[property]);
        string += ' = $' + values.length;
      } else if (query[property][iLike]) {
        values.push(query[property][iLike]);
        string += ' ILIKE $' + values.length;
      }
    } else {
      parents.push(property);
      const child = generateWhereQuery(query[property], model, values, parents);
      if (string.length) {
        string += ' AND ';
      }
      string += child.query;
      values = child.values;
    }

    return {
      query: string,
      values,
    };
  }
}

export default generateWhereQuery;
