export const postgresql = {
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PWD,
  database: process.env.POSTGRES_DB || 'v2land',
  port: process.env.POSTGRES_PORT || 5432,
};

export default { postgresql };
