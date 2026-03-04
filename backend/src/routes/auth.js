import express   from 'express';
import bcrypt    from 'bcryptjs';
import jwt       from 'jsonwebtoken';
import { query } from '../db/index.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'datalens_secret_2024';
const EXPIRE = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập username và password.' });
    }

    const result = await query(
      'SELECT * FROM users WHERE (username = $1 OR email = $1) AND is_active = TRUE',
      [username]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị khóa.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Mật khẩu không đúng.' });
    }

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role, full_name: user.full_name },
      SECRET,
      { expiresIn: EXPIRE }
    );

    res.json({
      token,
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        role:      user.role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
});

// POST /api/auth/me — kiểm tra token hiện tại
router.post('/me', async (req, res) => {
  const header = req.headers['authorization'];
  const token  = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const result  = await query('SELECT id, username, email, role, full_name, last_login FROM users WHERE id = $1', [decoded.id]);
    if (!result.rows[0]) return res.status(401).json({ error: 'Tài khoản không tồn tại.' });
    res.json({ user: result.rows[0] });
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ.' });
  }
});

export default router;
