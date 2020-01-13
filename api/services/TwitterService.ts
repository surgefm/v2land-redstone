import { Auth } from '@Models';
import { oauth } from '@Configs';

export async function tweet (auth: Auth, status: string) {
  return new Promise((resolve, reject) => {
    const oa = oauth.twitter;
    if (!oa) {
      reject(new Error('不支持发布推文：Twitter 未配置齐全'));
    }

    oa.post(
      'https://api.twitter.com/1.1/statuses/update.json',
      auth.accessToken,
      auth.accessTokenSecret,
      { status },
      'status',
      (err: { statusCode: number, data?: any }) => {
        if (err) return reject(err);
        resolve();
      });
  });
}
