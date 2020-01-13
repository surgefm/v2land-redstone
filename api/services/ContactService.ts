export function getTypeFromMethod (method: string) {
  switch (method) {
  case 'emailDailyReport':
    return 'email';
  case 'twitterAt':
    return 'twitter';
  case 'weiboAt':
    return 'weibo';
  case 'mobileAppNotification':
    return 'mobileApp';
  default:
    return method;
  }
}
