-- Row Level Security Policies for RuleGrid

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_token_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- profiles
-- =====================================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- subscriptions
-- =====================================================
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhook)
-- No INSERT/UPDATE policies for regular users

-- =====================================================
-- puzzles
-- =====================================================
CREATE POLICY "Authenticated users can view puzzles"
  ON puzzles FOR SELECT
  TO authenticated
  USING (true);

-- Only service role/admin can insert puzzles
-- No INSERT policy for regular users

-- =====================================================
-- attempts
-- =====================================================
CREATE POLICY "Users can view own attempts"
  ON attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own attempts"
  ON attempts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- daily_completions
-- =====================================================
CREATE POLICY "Users can view own daily completions"
  ON daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily completions"
  ON daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- streaks
-- =====================================================
CREATE POLICY "Users can view own streak"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- focus_token_ledger
-- =====================================================
CREATE POLICY "Users can view own token ledger"
  ON focus_token_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token ledger"
  ON focus_token_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- practice_quota
-- =====================================================
CREATE POLICY "Users can view own practice quota"
  ON practice_quota FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice quota"
  ON practice_quota FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice quota"
  ON practice_quota FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- feature_flags
-- =====================================================
CREATE POLICY "Authenticated users can view feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Only admin/service role can update feature flags
CREATE POLICY "Admins can update feature flags"
  ON feature_flags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
