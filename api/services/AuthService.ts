export function sanitize(auth: any) {
  for (const property of ['token', 'tokenSecret',
    'accessToken', 'accessTokenSecret', 'refreshToken']) {
    delete auth[property];
  }

  return auth;
}

export function getSiteName(method: string) {
  switch (method) {
  case 'twitterAt':
    return 'twitter';
  case 'weiboAt':
    return 'weibo';
  default:
    return method;
  }
}
