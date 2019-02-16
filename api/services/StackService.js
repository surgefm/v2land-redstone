const StackService = {

  findStack: require('./StackService/findStack'),

  getContribution: require('./StackService/getContribution'),

  acquireContributionsByStackList: require('./StackService/acquireContributionsByStackList'),

  updateStack: require('./StackService/updateStack'),

  updateElasticsearchIndex: require('./StackService/updateElasticsearchIndex'),

};

module.exports = StackService;
