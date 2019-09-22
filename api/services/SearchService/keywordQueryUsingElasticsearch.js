async function keywordQueryUsingElasticsearch (keyword) {
  if (!ElasticsearchService.client) return {};
  const queryBulk = [
    { index: 'events' },
    {
      query: {
        bool: {
          must: {
            multi_match: {
              query: keyword,
              fields: ['name', 'description'],
            },
          },
          filter: { term: { 'status': 'admitted' } },
        },
      },
      size: 10,
    },
    { index: 'stacks' },
    {
      query: {
        bool: {
          must: {
            multi_match: {
              query: keyword,
              fields: ['title', 'description'],
            },
          },
          filter: { term: { 'status': 'admitted' } },
        },
      },
      size: 10,
    },
    { index: 'news' },
    {
      query: {
        bool: {
          must: {
            multi_match: {
              query: keyword,
              fields: ['title', 'abstract'],
            },
          },
          filter: { term: { 'status': 'admitted' } },
        },
      },
      size: 10,
    },
    { index: 'clients' },
    { query: { match: { username: keyword } }, size: 10 },
  ];

  const { body } = await ElasticsearchService.msearch({ body: queryBulk });
  const { responses } = body;
  const results = {};
  for (let i = 0; i < 4; i++) {
    const type = ['events', 'stacks', 'news', 'clients'][i];
    results[type] = responses[i].hits;
  }
  return results;
}

module.exports = keywordQueryUsingElasticsearch;
