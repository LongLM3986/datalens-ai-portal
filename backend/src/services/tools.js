/**
 * Database tools cho Claude sử dụng khi phân tích dữ liệu
 * Claude sẽ gọi các tool này để truy vấn PostgreSQL
 */
import pool from '../db/index.js';

// Chỉ cho phép SELECT để an toàn
function assertSelectOnly(sql) {
  const upper = sql.trim().toUpperCase().replace(/\s+/g, ' ');
  if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
    throw new Error('Chỉ được phép dùng câu truy vấn SELECT hoặc WITH (CTE). Không được phép INSERT/UPDATE/DELETE/DROP.');
  }
}

/**
 * Thực thi câu SQL SELECT
 */
export async function executeQuery(sql) {
  assertSelectOnly(sql);
  try {
    const result = await pool.query(sql);
    return {
      rows:     result.rows,
      rowCount: result.rowCount,
      columns:  result.fields?.map(f => f.name) || [],
    };
  } catch (err) {
    throw new Error(`Lỗi SQL: ${err.message}`);
  }
}

/**
 * Liệt kê tất cả bảng và view trong database
 */
export async function listTables() {
  const result = await pool.query(`
    SELECT
      t.table_schema                                      AS schema,
      t.table_name                                        AS name,
      t.table_type                                        AS type,
      COALESCE(s.n_live_tup, 0)                          AS estimated_rows,
      COUNT(c.column_name)                                AS column_count
    FROM information_schema.tables t
    LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
    LEFT JOIN information_schema.columns c
           ON c.table_name = t.table_name AND c.table_schema = t.table_schema
    WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema')
      AND t.table_schema NOT LIKE 'pg_%'
    GROUP BY t.table_schema, t.table_name, t.table_type, s.n_live_tup
    ORDER BY t.table_schema, t.table_name
  `);
  return result.rows;
}

/**
 * Mô tả cấu trúc chi tiết của một bảng
 */
export async function describeTable(tableName) {
  // Xử lý schema.table_name
  const parts = tableName.split('.');
  const tName = parts[parts.length - 1];

  const cols = await pool.query(`
    SELECT
      c.column_name,
      c.data_type,
      c.is_nullable,
      c.column_default,
      c.character_maximum_length,
      c.numeric_precision
    FROM information_schema.columns c
    WHERE c.table_name = $1
    ORDER BY c.ordinal_position
  `, [tName]);

  // Lấy sample data (5 dòng đầu)
  let sample = [];
  try {
    assertSelectOnly(`SELECT * FROM ${tableName} LIMIT 5`);
    const sampleRes = await pool.query(`SELECT * FROM ${tableName} LIMIT 5`);
    sample = sampleRes.rows;
  } catch { /* bỏ qua nếu lỗi */ }

  return { columns: cols.rows, sample };
}

/**
 * Thống kê tổng quan database
 */
export async function getDatabaseOverview() {
  const result = await pool.query(`
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
      n_live_tup AS row_count
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  `);
  return result.rows;
}
