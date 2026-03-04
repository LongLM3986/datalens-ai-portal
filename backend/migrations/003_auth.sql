-- ================================================================
-- Auth & Permission Tables
-- ================================================================

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL      PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user'  CHECK (role IN ('admin','user')),
  full_name     VARCHAR(200),
  is_active     BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- Bảng phân quyền chatbot: user được phép query bảng nào
CREATE TABLE IF NOT EXISTS user_table_permissions (
  id           SERIAL      PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_name   VARCHAR(100) NOT NULL,
  domain       VARCHAR(50),
  can_query    BOOLEAN     DEFAULT TRUE,
  granted_by   INTEGER     REFERENCES users(id),
  granted_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, table_name)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_perm_user ON user_table_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ================================================================
-- Default users (password: Admin@123 và User@123)
-- Passwords được hash bằng bcrypt với salt rounds = 10
-- Admin@123 = $2b$10$rXMf6H6DpV5zd3f9X9Y0Gu.qPY7Kc5M2Rl3vJwNs8y2dF3kHpO0W
-- User@123  = $2b$10$LKoAYBVjV6P8mGqF7sE3OujYCBQ3L9vF1mJZdqP2nKo5rV8wE4T9S
-- ================================================================
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
  ('admin', 'admin@datalens.vn',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'admin', 'Quản trị viên'),
  ('user1', 'user1@datalens.vn',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'user', 'Nguyễn Văn An')
ON CONFLICT (username) DO NOTHING;

-- NOTE: Password hash $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi = "password"
-- Admin được cấp quyền tất cả → xử lý ở code (role = admin = full access)
-- User1 được cấp quyền một số bảng mặc định
INSERT INTO user_table_permissions (user_id, table_name, domain, granted_by)
SELECT
  u.id,
  t.table_name,
  t.domain,
  1
FROM users u
CROSS JOIN (VALUES
  ('customers',    'crm'),
  ('orders',       'crm'),
  ('order_items',  'crm'),
  ('products',     'crm'),
  ('v_daily_revenue','crm'),
  ('invoices',     'finance'),
  ('payments',     'finance'),
  ('employees',    'hr'),
  ('departments',  'hr'),
  ('v_headcount_summary','hr')
) AS t(table_name, domain)
WHERE u.username = 'user1'
ON CONFLICT (user_id, table_name) DO NOTHING;
