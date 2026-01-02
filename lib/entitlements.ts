import { createClient } from './supabaseServer';

export interface Entitlements {
  isPro: boolean;
  archiveDays: number;
  practiceLimit: number;
  practiceRemainingToday: number;
  focusTokenBalance: number;
}

const FREE_PRACTICE_LIMIT = 10;
const FREE_ARCHIVE_DAYS = 7;
const PRO_ARCHIVE_DAYS = 365;

/**
 * Check if user has an active Pro subscription
 */
export async function isPro(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single();

  if (!data) return false;

  const isActive = ['trialing', 'active'].includes(data.status);
  const notExpired =
    !data.current_period_end ||
    new Date(data.current_period_end) > new Date();

  return isActive && notExpired;
}

/**
 * Get practice quota remaining for today
 */
export async function getPracticeQuotaRemaining(
  userId: string,
  userIsPro: boolean
): Promise<number> {
  if (userIsPro) {
    return Infinity; // Unlimited
  }

  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('practice_quota')
    .select('used_count')
    .eq('user_id', userId)
    .eq('quota_date', today)
    .single();

  const used = data?.used_count || 0;
  return Math.max(0, FREE_PRACTICE_LIMIT - used);
}

/**
 * Increment practice quota usage
 */
export async function incrementPracticeQuota(userId: string): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  // Upsert quota record
  const { data: existing } = await supabase
    .from('practice_quota')
    .select('used_count')
    .eq('user_id', userId)
    .eq('quota_date', today)
    .single();

  if (existing) {
    await supabase
      .from('practice_quota')
      .update({ used_count: existing.used_count + 1, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('quota_date', today);
  } else {
    await supabase.from('practice_quota').insert({
      user_id: userId,
      quota_date: today,
      used_count: 1,
    });
  }
}

/**
 * Get archive access days based on subscription
 */
export async function getArchiveAccessDays(userId: string): Promise<number> {
  const userIsPro = await isPro(userId);
  return userIsPro ? PRO_ARCHIVE_DAYS : FREE_ARCHIVE_DAYS;
}

/**
 * Get Focus Token balance
 */
export async function getFocusTokenBalance(userId: string): Promise<number> {
  const supabase = createClient();

  const { data } = await supabase
    .from('focus_token_ledger')
    .select('delta')
    .eq('user_id', userId);

  if (!data) return 0;

  return data.reduce((sum, entry) => sum + entry.delta, 0);
}

/**
 * Get all entitlements for a user
 */
export async function getUserEntitlements(
  userId: string
): Promise<Entitlements> {
  const userIsPro = await isPro(userId);
  const practiceRemainingToday = await getPracticeQuotaRemaining(
    userId,
    userIsPro
  );
  const focusTokenBalance = await getFocusTokenBalance(userId);

  return {
    isPro: userIsPro,
    archiveDays: userIsPro ? PRO_ARCHIVE_DAYS : FREE_ARCHIVE_DAYS,
    practiceLimit: FREE_PRACTICE_LIMIT,
    practiceRemainingToday,
    focusTokenBalance,
  };
}
