import _ from 'lodash';
import { RedstoneError, InvalidInputErrorType, RedstoneResponse } from '@Types';

function validatePassword(value: string, response?: RedstoneResponse) {
  if (!_.isString(value)) {
    throw new RedstoneError(InvalidInputErrorType, response.__('Password_should_be_string'));
  } else if (value.length < 6 || value.length > 64) {
    throw new RedstoneError(InvalidInputErrorType, response.__('Password_length_invalid'));
  } else if (!(value.match(/[A-z]/i) && value.match(/[0-9]/))) {
    throw new RedstoneError(InvalidInputErrorType, response.__('Password_should_combine_num_alpha'));
  }
}

export default validatePassword;
