export default {
  cors: {

    /** *************************************************************************
  *                                                                          *
  * Which domains which are allowed CORS access? This can be a               *
  * comma-delimited list of hosts (beginning with http:// or https://) or    *
  * "*" to allow all domains CORS access.                                    *
  *                                                                          *
  ***************************************************************************/

    origin: (process.env.CORS || 'http://localhost:3000,http://local.langchao.org:3000,https://langchao.org,https://v2land.net').split(','),

    /** *************************************************************************
  *                                                                          *
  * Allow cookies to be shared for CORS requests?                            *
  *                                                                          *
  ***************************************************************************/

    credentials: true,
  },
};
