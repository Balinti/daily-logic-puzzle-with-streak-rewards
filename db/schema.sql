-- RuleGrid Daily Logic Puzzle Database Schema
-- Run this against your Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name TEXT NULL,
  email TEXT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  posthog_distinct_id TEXT NULL
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. subscriptions
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('none','trialing','active','past_due','canceled','unpaid')),
  price_id TEXT NULL,
  current_period_end TIMESTAMPTZ NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

-- =====================================================
-- 3. puzzles
-- =====================================================
CREATE TABLE IF NOT EXISTS puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('daily','practice')),
  puzzle_date DATE NULL,
  seed TEXT NOT NULL,
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  symbols JSONB NOT NULL,
  rule_cards JSONB NOT NULL,
  solution_hash TEXT NOT NULL,
  solution_encrypted TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure each daily date has only one puzzle
CREATE UNIQUE INDEX IF NOT EXISTS puzzles_daily_date_idx ON puzzles(kind, puzzle_date) WHERE kind = 'daily';
CREATE INDEX IF NOT EXISTS puzzles_kind_created_idx ON puzzles(kind, created_at DESC);

-- =====================================================
-- 4. attempts
-- =====================================================
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_id UUID NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('daily','practice','archive')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  duration_ms INT NULL,
  mistakes INT NOT NULL DEFAULT 0,
  nudges_used INT NOT NULL DEFAULT 0,
  checks_used INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  result TEXT NOT NULL DEFAULT 'in_progress' CHECK (result IN ('in_progress','success','fail')),
  final_grid JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attempts_user_started_idx ON attempts(user_id, started_at DESC);
-- Only one daily attempt record per user per puzzle (allows updates for same daily)
CREATE UNIQUE INDEX IF NOT EXISTS attempts_daily_unique_idx ON attempts(user_id, puzzle_id, mode) WHERE mode = 'daily';

-- =====================================================
-- 5. daily_completions
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_date DATE NOT NULL,
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  duration_ms INT NOT NULL,
  mistakes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_completions_user_date_idx ON daily_completions(user_id, puzzle_date);
CREATE INDEX IF NOT EXISTS daily_completions_user_created_idx ON daily_completions(user_id, created_at DESC);

-- =====================================================
-- 6. streaks
-- =====================================================
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_completed_date DATE NULL,
  protected_until_date DATE NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. focus_token_ledger
-- =====================================================
CREATE TABLE IF NOT EXISTS focus_token_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('monthly_grant_free','monthly_grant_pro','spend_cover_miss','admin_adjust')),
  related_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS focus_token_ledger_user_created_idx ON focus_token_ledger(user_id, created_at DESC);

-- =====================================================
-- 8. practice_quota
-- =====================================================
CREATE TABLE IF NOT EXISTS practice_quota (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quota_date DATE NOT NULL,
  used_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, quota_date)
);

CREATE INDEX IF NOT EXISTS practice_quota_date_idx ON practice_quota(quota_date DESC);

-- =====================================================
-- 9. feature_flags
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial feature flags
INSERT INTO feature_flags (key, value) VALUES
  ('rule_cards_enabled', '{"LEFT_OF":true,"NOT_IN_ROW":true,"NOT_IN_COL":true,"EXACT_COUNT_ROW":true,"ADJACENT":true,"SAME_MAIN_DIAGONAL":false}'::jsonb),
  ('daily_generation', '{"enabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Helper functions
-- =====================================================

-- Get focus token balance for a user
CREATE OR REPLACE FUNCTION get_focus_token_balance(p_user_id UUID)
RETURNS INT AS $$
  SELECT COALESCE(SUM(delta), 0)::INT
  FROM focus_token_ledger
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- Check if user is Pro
CREATE OR REPLACE FUNCTION is_user_pro(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
    AND status IN ('trialing', 'active')
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
$$ LANGUAGE SQL STABLE;
