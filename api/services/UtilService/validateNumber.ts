import * as _ from 'lodash';

function validateNumber (value: any, defaultValue: number) {
  if (_.isNumber(value)) {
    return value as number;
  } else if (_.isString(value)) {
    if (/^\+?(0|[1-9]\d*)$/.test(value)) {
      return parseInt(value);
    } else {
      return undefined;
    }
  }

  return defaultValue;
}

export default validateNumber;
