const _ = require('lodash');

function validateNumber (value, defaultValue) {
  if (_.isNumber(value)) {
    return value;
  } else if (_.isString(value)) {
    if (/^\+?(0|[1-9]\d*)$/.test(value)) {
      return parseInt(value);
    } else {
      return undefined;
    }
  }

  return defaultValue;
}

module.exports = validateNumber;
