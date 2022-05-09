import { InvalidInputErrorType, RedstoneError } from '@Types';

const forbiddenUsernameSet: Set<string> = new Set<string>(['event', 'topic', 'register',
  'login', 'logout', 'about', 'dashboard', 'trending', 'topics', 'settings', 'signup']);

function validateUsername(value: string) {
  if (forbiddenUsernameSet.has(value)) {
    throw new RedstoneError(InvalidInputErrorType, '用户名不合法');
  }
}

export default validateUsername;
