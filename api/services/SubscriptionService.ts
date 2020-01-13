const uniqueString = require('unique-string');

export function generateUnsubscribeId () {
  return uniqueString();
}
