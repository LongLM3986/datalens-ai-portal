import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import pool from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  const files = ['001_init.sql', '002_dwh_tables.sql', '003_auth.sql', '004_sample_data.sql'];
  for (const file of files) {
    try {
      const sql = await readFile(join(__dirname, '../../migrations', file), 'utf-8');
      await pool.query(sql);
      console.log(`✅ Migration ${file} OK`);
    } catch (e) {
      console.log(`⚠️  Migration ${file}: ${e.message}`);
    }
  }
}
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import sessionsRouter from './routes/sessions.js';
import adminRouter from './routes/admin.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép tất cả origin nếu CORS_ORIGIN là * (sau đó trả về chính origin đó để hợp lệ với credentials:true)
    if (!origin || process.env.CORS_ORIGIN === '*') return callback(null, true);
    callback(null, process.env.CORS_ORIGIN);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/admin', adminRouter);
app.get('/api/health', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ status: 'ok', db: 'connected', db_name: process.env.DB_NAME || 'mywebportal', model: process.env.CLAUDE_MODEL || 'claude-opus-4-6' }); }
  catch (err) { res.status(500).json({ status: 'error', db: err.message }); }
});
app.get('/api/domains', async (_req, res) => {
  try {
    const tables = await pool.query(`
      SELECT table_name AS name, table_type AS type,
        COALESCE(s.n_live_tup,0) AS estimated_rows,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name=t.table_name AND c.table_schema='public') AS column_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname=t.table_name
      WHERE t.table_schema='public'
        AND t.table_name NOT IN ('chat_sessions','chat_messages','users','user_table_permissions')
      ORDER BY table_name
    `);
    res.json(tables.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.listen(PORT, async () => {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║     DataLens AI Portal v2 - Backend   ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'mywebportal'} @ ${process.env.DB_HOST || 'localhost'}`);
  console.log(`🤖 Claude: ${process.env.CLAUDE_MODEL || 'claude-opus-4-6'}`);
  console.log(`🤖 Groq:   ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'}\n`);
  try { await pool.query('SELECT 1'); console.log('✅ Database connected'); }
  catch (e) { console.error('❌ DB error:', e.message); }
  await runMigrations();
});
