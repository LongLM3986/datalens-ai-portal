-- ================================================================
-- WebPortalVip - Database Schema cho mywebportal
-- ================================================================

-- Extension cần thiết
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- Bảng chat_sessions: Lưu các cuộc hội thoại
-- ================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL DEFAULT 'Cuộc hội thoại mới',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ================================================================
-- Bảng chat_messages: Lưu tin nhắn
-- ================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID         NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT         NOT NULL,
  metadata    JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ================================================================
-- Indexes
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON chat_sessions(updated_at DESC);

-- ================================================================
-- Trigger tự động cập nhật updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sessions_timestamp ON chat_sessions;
CREATE TRIGGER trg_sessions_timestamp
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
