import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'mywebportal',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD,
  max:      20,
  idleTimeoutMillis:    30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.error('❌ Lỗi kết nối PostgreSQL:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
