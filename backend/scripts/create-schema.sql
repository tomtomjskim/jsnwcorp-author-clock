-- Author Clock Database Schema
-- Created: 2025-10-31
-- Description: MVP schema for Author Clock project

-- ==========================================
-- 1. Create Schema
-- ==========================================
CREATE SCHEMA IF NOT EXISTS author_clock;

-- ==========================================
-- 2. Quotes Table (명언 저장)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.quotes (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,                         -- 명언 본문
  author VARCHAR(200) NOT NULL,               -- 저자
  source VARCHAR(300),                        -- 출처 (책 제목, 작품명)
  source_url TEXT,                            -- 출처 URL (저작권 확인용)
  language VARCHAR(10) NOT NULL DEFAULT 'ko', -- 언어 코드 (ko, en, ja, zh)
  category VARCHAR(50),                       -- 카테고리 (classic, philosophy, etc.)
  is_public_domain BOOLEAN DEFAULT true,      -- 퍼블릭 도메인 여부
  is_approved BOOLEAN DEFAULT true,           -- 관리자 승인 여부 (MVP는 모두 true)
  submitted_by INTEGER,                       -- 제출한 사용자 ID (MVP는 NULL)
  likes_count INTEGER DEFAULT 0,              -- 좋아요 수
  views_count INTEGER DEFAULT 0,              -- 조회수
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT quotes_text_length CHECK (length(text) <= 500),
  CONSTRAINT quotes_language_check CHECK (language IN ('ko', 'en', 'ja', 'zh', 'es', 'fr', 'de'))
);

-- Indexes for quotes table
CREATE INDEX IF NOT EXISTS idx_quotes_language ON author_clock.quotes(language);
CREATE INDEX IF NOT EXISTS idx_quotes_approved ON author_clock.quotes(is_approved);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON author_clock.quotes(category);

COMMENT ON TABLE author_clock.quotes IS '명언 저장 테이블';
COMMENT ON COLUMN author_clock.quotes.text IS '명언 본문 (최대 500자)';
COMMENT ON COLUMN author_clock.quotes.author IS '저자명';
COMMENT ON COLUMN author_clock.quotes.source IS '출처 (책 제목, 작품명 등)';
COMMENT ON COLUMN author_clock.quotes.language IS '언어 코드 (ISO 639-1)';

-- ==========================================
-- 3. Daily Quotes Table (일일 명언 기록)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.daily_quotes (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES author_clock.quotes(id) ON DELETE CASCADE,
  date DATE NOT NULL,                         -- 날짜 (하루 단위 고정)
  language VARCHAR(10) NOT NULL DEFAULT 'ko',
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT daily_quotes_unique_date_lang UNIQUE (date, language)
);

-- Indexes for daily_quotes table
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date ON author_clock.daily_quotes(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_quote_id ON author_clock.daily_quotes(quote_id);

COMMENT ON TABLE author_clock.daily_quotes IS '일일 명언 기록 테이블 (날짜별로 고정된 명언 추적)';

-- ==========================================
-- 4. Users Table (MVP Phase 2 준비용)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  preferred_language VARCHAR(10) DEFAULT 'ko',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT users_username_length CHECK (length(username) >= 3),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON author_clock.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON author_clock.users(email);

COMMENT ON TABLE author_clock.users IS '사용자 테이블 (Phase 2에서 사용)';

-- ==========================================
-- 5. User Likes Table (MVP Phase 2 준비용)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.user_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES author_clock.users(id) ON DELETE CASCADE,
  quote_id INTEGER NOT NULL REFERENCES author_clock.quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT user_likes_unique UNIQUE (user_id, quote_id)
);

-- Indexes for user_likes table
CREATE INDEX IF NOT EXISTS idx_user_likes_user ON author_clock.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_quote ON author_clock.user_likes(quote_id);

COMMENT ON TABLE author_clock.user_likes IS '사용자 좋아요 테이블 (Phase 2에서 사용)';

-- ==========================================
-- 6. View Logs Table (조회 로그 - 선택적)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.view_logs (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES author_clock.quotes(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES author_clock.users(id) ON DELETE SET NULL,  -- NULL = 비로그인
  viewed_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Indexes for view_logs table
CREATE INDEX IF NOT EXISTS idx_view_logs_quote ON author_clock.view_logs(quote_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_viewed_at ON author_clock.view_logs(viewed_at DESC);

COMMENT ON TABLE author_clock.view_logs IS '명언 조회 로그 (분석용, Phase 2 이후 고려)';

-- ==========================================
-- 7. Translations Table (명언 번역 - Phase 3 준비용)
-- ==========================================
CREATE TABLE IF NOT EXISTS author_clock.translations (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES author_clock.quotes(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  translated_by INTEGER REFERENCES author_clock.users(id) ON DELETE SET NULL,
  is_auto_translation BOOLEAN DEFAULT false,  -- 기계번역 여부
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT translations_unique UNIQUE (quote_id, language),
  CONSTRAINT translations_text_length CHECK (length(translated_text) <= 500)
);

-- Indexes for translations table
CREATE INDEX IF NOT EXISTS idx_translations_quote ON author_clock.translations(quote_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON author_clock.translations(language);

COMMENT ON TABLE author_clock.translations IS '명언 번역 테이블 (Phase 3에서 사용)';

-- ==========================================
-- 8. Create Database User
-- ==========================================

-- Check if user exists, if not create
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'author_clock_user') THEN
    CREATE USER author_clock_user WITH PASSWORD 'AuthorClock2025!Secure';
  END IF;
END
$$;

-- Grant schema usage
GRANT USAGE ON SCHEMA author_clock TO author_clock_user;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA author_clock TO author_clock_user;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA author_clock TO author_clock_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA author_clock
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO author_clock_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA author_clock
  GRANT USAGE, SELECT ON SEQUENCES TO author_clock_user;

-- ==========================================
-- 9. Verification Queries
-- ==========================================

-- List all tables in author_clock schema
-- \dt author_clock.*

-- Check user permissions
-- \du author_clock_user

-- Count quotes
-- SELECT COUNT(*) FROM author_clock.quotes;

-- ==========================================
-- Success Message
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Author Clock schema created successfully!';
  RAISE NOTICE '✅ User "author_clock_user" created with appropriate permissions';
  RAISE NOTICE '✅ Tables: quotes, daily_quotes, users, user_likes, view_logs, translations';
  RAISE NOTICE '📝 Next step: Run seed script to insert initial quotes data';
END
$$;
