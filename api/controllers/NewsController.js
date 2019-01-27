/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  getAllPendingNews: require('./NewsController/getAllPendingNews'),

  getNews: require('./NewsController/getNews'),

  getNewsList: require('./NewsController/getNewsList'),

  updateNews: require('./NewsController/updateNews'),

};
