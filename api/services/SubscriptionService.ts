import uniqueString from 'unique-string';

export function generateUnsubscribeId() {
  return uniqueString();
}
