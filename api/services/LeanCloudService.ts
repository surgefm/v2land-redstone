const AV = require('leancloud-storage');

export async function pushNotification (objectId: string, data: any) {
  const query = new AV.Query('_installation');
  query.equalTo('objectId', objectId);
  return AV.Push.send({
    where: query,
    data,
  });
}
