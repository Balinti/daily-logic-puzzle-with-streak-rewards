import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import { getFocusTokenBalance } from '@/lib/entitlements';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';
import { isWithinDays } from '@/lib/dates';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    // Rate limiting
    const { success } = await checkRateLimit(
      rateLimiters.focusTokens,
      user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { cover_date } = body;

    if (!cover_date) {
      return NextResponse.json(
        { error: 'Missing cover_date' },
        { status: 400 }
      );
    }

    // Validate cover_date is within last 7 days
    if (!isWithinDays(cover_date, 7)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INVALID_DATE',
          message: 'Can only cover missed days within the last 7 days',
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if already completed on that date
    const { data: existing } = await supabase
      .from('daily_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('puzzle_date', cover_date)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: 'ALREADY_COMPLETED',
          message: 'This date is already completed',
        },
        { status: 400 }
      );
    }

    // Check token balance
    const balance = await getFocusTokenBalance(user.id);

    if (balance < 1) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INSUFFICIENT_TOKENS',
          balance: 0,
        },
        { status: 400 }
      );
    }

    // Spend token
    await supabase.from('focus_token_ledger').insert({
      user_id: user.id,
      delta: -1,
      reason: 'spend_cover_miss',
      related_date: cover_date,
    });

    // Update streak protection
    await supabase
      .from('streaks')
      .update({
        protected_until_date: cover_date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Fetch updated streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const newBalance = balance - 1;

    return NextResponse.json({
      ok: true,
      balance: newBalance,
      streak: {
        current: streak?.current_streak || 0,
        longest: streak?.longest_streak || 0,
        protected_until_date: cover_date,
      },
    });
  } catch (error: any) {
    console.error('Focus token use error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to use focus token' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
