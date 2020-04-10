export const postgresql = {
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PWD,
  database: process.env.POSTGRES_DB || 'v2land',
  port: +process.env.POSTGRES_PORT || 5432,
};

export const redis = process.env.REDIS_HOST ? {
  db: +process.env.REDIS_DB || 0,
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PWD,
  prefix: process.env.REDIS_PREFIX || 'v2land-',
} : {};

export default { postgresql, redis };
