import request from 'superagent';
import urlencode from 'urlencode';

import { Auth } from '@Models';

export async function post (auth: Auth, status: string) {
  return new Promise((resolve, reject) => {
    request
      .post('https://api.weibo.com/2/statuses/share.json?' +
        'access_token=' + auth.accessToken +
        '&status=' + urlencode(status)
      )
      .type('form')
      .end(err => {
        if (err) return reject(err);
        resolve();
      });
  });
}
