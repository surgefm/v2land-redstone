/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	getAllPendingNews: async (req, res) => {
    let newsCollection = await News.find({
      status: 'pending'
    });

    return res.status(200).json(newsCollection);
  }
};
