module.exports = {

  keywordSearch: async (req, res) => {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({
        message: 'Missing parameter: keyword.',
      });
    }

    const searchResults = await SearchService.keywordQueryUsingElasticsearch(keyword);
    res.status(200).json({
      results: searchResults,
    });
  },

};
