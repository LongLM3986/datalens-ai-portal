/**
 * Admin Routes - Quản lý users & phân quyền chatbot
 * Tất cả routes này chỉ dành cho admin
 */
import express   from 'express';
import bcrypt    from 'bcryptjs';
import { query } from '../db/index.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware, adminOnly);

// ── USERS ───────────────────────────────────────────────────────

// GET /api/admin/users — Danh sách users
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.username, u.email, u.role, u.full_name, u.is_active, u.created_at, u.last_login,
             COUNT(p.id) AS permission_count
      FROM users u
      LEFT JOIN user_table_permissions p ON p.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/users — Tạo user mới
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role = 'user', full_name } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Thiếu username, email hoặc password.' });
    }
    const hash   = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password_hash, role, full_name) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, email, role, full_name',
      [username, email, hash, role, full_name || username]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username hoặc email đã tồn tại.' });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id — Cập nhật user
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, full_name, is_active, password } = req.body;
    const updates = [];
    const vals    = [];
    let   i       = 1;

    if (role      !== undefined) { updates.push(`role      = $${i++}`); vals.push(role); }
    if (full_name !== undefined) { updates.push(`full_name = $${i++}`); vals.push(full_name); }
    if (is_active !== undefined) { updates.push(`is_active = $${i++}`); vals.push(is_active); }
    if (password)                { updates.push(`password_hash = $${i++}`); vals.push(await bcrypt.hash(password, 10)); }

    if (!updates.length) return res.status(400).json({ error: 'Không có gì để cập nhật.' });

    vals.push(req.params.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, username, email, role, full_name, is_active`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/users/:id — Xóa user (không cho xóa chính mình)
router.delete('/users/:id', async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Không thể xóa tài khoản đang đăng nhập.' });
    }
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PERMISSIONS ─────────────────────────────────────────────────

// GET /api/admin/permissions/:userId — Lấy danh sách quyền của một user
router.get('/permissions/:userId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_table_permissions WHERE user_id = $1 ORDER BY domain, table_name',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/permissions — Cấp quyền bảng cho user
router.post('/permissions', async (req, res) => {
  try {
    const { user_id, table_name, domain } = req.body;
    if (!user_id || !table_name) return res.status(400).json({ error: 'Thiếu user_id hoặc table_name.' });

    const result = await query(
      `INSERT INTO user_table_permissions (user_id, table_name, domain, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, table_name) DO UPDATE SET can_query = TRUE, granted_by = $4
       RETURNING *`,
      [user_id, table_name, domain || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/permissions/bulk — Cấp/thu hồi nhiều bảng cùng lúc
router.post('/permissions/bulk', async (req, res) => {
  try {
    const { user_id, tables } = req.body;
    // tables = [{ table_name, domain, can_query }]
    if (!user_id || !Array.isArray(tables)) return res.status(400).json({ error: 'Thiếu dữ liệu.' });

    // Xóa tất cả quyền cũ rồi insert lại
    await query('DELETE FROM user_table_permissions WHERE user_id = $1', [user_id]);

    if (tables.length > 0) {
      const values = tables.map((t, i) => `($1, $${i*3+2}, $${i*3+3}, $${i*3+4}, ${req.user.id})`).join(', ');
      const params = [user_id];
      tables.forEach(t => { params.push(t.table_name, t.domain || null, t.can_query !== false); });

      // Rebuild với placeholders đúng
      const rows   = tables.map((_, i) => `($1, $${i*3+2}, $${i*3+3}, $${i*3+4}, ${req.user.id})`);
      const flat   = [user_id];
      tables.forEach(t => flat.push(t.table_name, t.domain || null, t.can_query !== false));
      await query(
        `INSERT INTO user_table_permissions (user_id, table_name, domain, can_query, granted_by) VALUES ${rows.join(',')}`,
        flat
      );
    }

    res.json({ success: true, count: tables.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/permissions/:id — Thu hồi quyền
router.delete('/permissions/:id', async (req, res) => {
  try {
    await query('DELETE FROM user_table_permissions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/all-tables — Lấy toàn bộ danh sách bảng trong DB (cho admin phân quyền)
router.get('/all-tables', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        t.table_schema AS schema,
        t.table_name   AS name,
        t.table_type   AS type,
        COALESCE(s.n_live_tup, 0) AS estimated_rows,
        COUNT(c.column_name) AS column_count
      FROM information_schema.tables t
      LEFT JOIN pg_stat_user_tables s ON s.relname = t.table_name
      LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
      WHERE t.table_schema = 'public'
        AND t.table_name NOT IN ('chat_sessions','chat_messages','users','user_table_permissions')
      GROUP BY t.table_schema, t.table_name, t.table_type, s.n_live_tup
      ORDER BY t.table_name
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
