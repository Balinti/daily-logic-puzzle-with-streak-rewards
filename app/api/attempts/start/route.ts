import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();

    // Rate limiting
    const { success } = await checkRateLimit(
      rateLimiters.attempts,
      user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { puzzle_id, mode } = body;

    if (!puzzle_id || !mode) {
      return NextResponse.json(
        { error: 'Missing puzzle_id or mode' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // For daily mode, check if attempt already exists (allow resume)
    if (mode === 'daily') {
      const { data: existing } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', user.id)
        .eq('puzzle_id', puzzle_id)
        .eq('mode', 'daily')
        .single();

      if (existing) {
        // Return existing attempt
        return NextResponse.json({
          attempt: {
            id: existing.id,
            started_at: existing.started_at,
            nudges_used: existing.nudges_used,
            mistakes: existing.mistakes,
          },
        });
      }
    }

    // Create new attempt
    const { data: attempt, error } = await supabase
      .from('attempts')
      .insert({
        user_id: user.id,
        puzzle_id,
        mode,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !attempt) {
      throw error || new Error('Failed to create attempt');
    }

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        started_at: attempt.started_at,
        nudges_used: attempt.nudges_used,
        mistakes: attempt.mistakes,
      },
    });
  } catch (error: any) {
    console.error('Start attempt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start attempt' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
