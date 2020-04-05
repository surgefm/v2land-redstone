export default {

  onlyAllowOrigins: (process.env.CORS || 'http://localhost:3000,https://langchao.org,https://v2land.net').split(','),

};
