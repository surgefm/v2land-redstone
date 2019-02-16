module.exports = {

  getEventList: require('./EventService/getEventList'),

  findEvent: require('./EventService/findEvent'),

  getContribution: require('./EventService/getContribution'),

  acquireContributionsByEventList: require('./EventService/acquireContributionsByEventList'),

  generatePinyin: require('./EventService/generatePinyin'),

  updateElasticsearchIndex: require('./EventService/updateElasticsearchIndex'),

  updateAdmittedLatestNews: require('./EventService/updateAdmittedLatestNews'),

};
