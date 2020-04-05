import _ from 'lodash';
import { RedstoneError, InvalidInputErrorType } from '@Types';

function validatePassword(value: string) {
  if (!_.isString(value)) {
    throw new RedstoneError(InvalidInputErrorType, '密码应为字符串类型');
  } else if (value.length < 6 || value.length > 64) {
    throw new RedstoneError(InvalidInputErrorType, '密码长度应在 6-64 个字符内');
  } else if (!(value.match(/[A-z]/i) && value.match(/[0-9]/))) {
    throw new RedstoneError(InvalidInputErrorType, '密码应为英文字符和数字结合');
  }
}

export default validatePassword;
