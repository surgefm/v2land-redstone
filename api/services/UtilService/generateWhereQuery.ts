/**
 * 生成 WHERE 语句
 */
import { Op } from 'sequelize';

const { iLike } = Op;

function generateWhereQuery(query: any, model = '', values: any[] = [], parents: any[] = []) {
  let string = '';
  const properties = [...Object.getOwnPropertyNames(query), ...Object.getOwnPropertySymbols(query)];
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
      ].includes(property as string)
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
        string += (model ? (model + '.') : '') + (property as string);
      }

      if (typeof query[property] !== 'object' || query[property] instanceof Date) {
        values.push(query[property]);
        string += ' = $' + values.length;
      } else if (query[property][iLike]) {
        values.push(query[property][iLike]);
        string += ' ILIKE $' + values.length;
      }
    } else if (property === Op.or) {
      if (string.length) {
        string += ' AND ';
      }
      string += '(';
      const options = query[Op.or];
      for (let j = 0; j < options.length; j++) {
        string += '('
        const child = generateWhereQuery(query[Op.or][j], model, values, parents);
        string += child.query;
        string += ')';
        values = child.values;
        if (j !== options.length - 1) string += ' OR ';
      }
      string += ')'
    } else {
      const child = generateWhereQuery(query[property], model, values, [...parents, property]);
      if (string.length) {
        string += ' AND ';
      }
      string += child.query;
      values = child.values;
    }
  }

  return {
    query: string,
    values,
  };
}

export default generateWhereQuery;
