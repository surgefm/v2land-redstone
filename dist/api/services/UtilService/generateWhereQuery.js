"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 生成 WHERE 语句
 */
const sequelize_1 = require("sequelize");
const { iLike } = sequelize_1.Op;
function generateWhereQuery(query, model = '', values = [], parents = []) {
    let string = '';
    const properties = [...Object.getOwnPropertyNames(query), ...Object.getOwnPropertySymbols(query)];
    for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        let temp = parents.slice();
        if (typeof query[property] === 'undefined' ||
            [
                '_properties',
                'associations',
                'associationsCache',
                'inspect',
                'add',
                'remove',
            ].includes(property)) {
            continue;
        }
        else if (typeof query[property] !== 'object' ||
            query[property] instanceof Date ||
            query[property][iLike]) {
            if (string.length) {
                string += ' AND ';
            }
            if (temp.length > 0) {
                string += `"${temp[0]}"::json#>>'{`;
                temp = temp.slice(1);
                temp.push(property);
                string += `${temp.join(',')}}'`;
            }
            else {
                string += (model ? (model + '.') : '') + property;
            }
            if (typeof query[property] !== 'object' || query[property] instanceof Date) {
                values.push(query[property]);
                string += ' = $' + values.length;
            }
            else if (query[property][iLike]) {
                values.push(query[property][iLike]);
                string += ' ILIKE $' + values.length;
            }
        }
        else if (property === sequelize_1.Op.or) {
            if (string.length) {
                string += ' AND ';
            }
            string += '(';
            const options = query[sequelize_1.Op.or];
            for (let j = 0; j < options.length; j++) {
                string += '(';
                const child = generateWhereQuery(query[sequelize_1.Op.or][j], model, values, parents);
                string += child.query;
                string += ')';
                values = child.values;
                if (j !== options.length - 1)
                    string += ' OR ';
            }
            string += ')';
        }
        else {
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
exports.default = generateWhereQuery;

//# sourceMappingURL=generateWhereQuery.js.map
