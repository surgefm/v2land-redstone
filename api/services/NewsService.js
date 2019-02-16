const NewsService = {

  getContribution: require('./NewsService/getContribution'),

  acquireContributionsByNewsList: require('./NewsService/acquireContributionsByNewsList'),

  updateElasticsearchIndex: require('./NewsService/updateElasticsearchIndex'),

};

module.exports = NewsService;
