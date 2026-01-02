import { createClient } from './supabaseServer';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedUser extends User {
  profile?: {
    is_admin: boolean;
    display_name: string | null;
    timezone: string;
  };
}

/**
 * Get the current user from the session (server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<AuthenticatedUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, display_name, timezone')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile: profile || undefined,
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (!user.profile?.is_admin) {
    throw new Error('Forbidden - Admin access required');
  }

  return user;
}

/**
 * Check if email is in admin allowlist
 */
export function isEmailInAdminAllowlist(email: string): boolean {
  const allowlist = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',') || [];
  return allowlist.map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}
