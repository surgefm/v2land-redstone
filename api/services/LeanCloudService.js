const AV = require('leancloud-storage');

const LeanCloudService = {
  pushNotification: async (objectId, data) => {
    const query = new AV.Query('_installation');
    query.equalTo('objectId', objectId);
    return AV.Push.send({
      where: query,
      data,
    });
  },
};

module.exports = LeanCloudService;
