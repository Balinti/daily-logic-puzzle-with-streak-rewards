import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import { getArchiveAccessDays } from '@/lib/entitlements';
import { isWithinDays, getTodayUTC } from '@/lib/dates';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createClient();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || getTodayUTC();

    // Get archive access days based on subscription
    const archiveDays = await getArchiveAccessDays(user.id);

    // Validate date range access
    if (from && !isWithinDays(from, archiveDays)) {
      return NextResponse.json(
        {
          error: 'ARCHIVE_GATED',
          allowed_days: archiveDays,
        },
        { status: 403 }
      );
    }

    // Fetch puzzles in date range
    const { data: puzzles, error: puzzlesError } = await supabase
      .from('puzzles')
      .select('id, puzzle_date, difficulty')
      .eq('kind', 'daily')
      .gte('puzzle_date', from)
      .lte('puzzle_date', to)
      .order('puzzle_date', { ascending: false });

    if (puzzlesError) {
      throw puzzlesError;
    }

    // Fetch user's completions for these dates
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('puzzle_date, duration_ms, mistakes')
      .eq('user_id', user.id)
      .gte('puzzle_date', from)
      .lte('puzzle_date', to);

    const completionMap = new Map(
      completions?.map((c) => [c.puzzle_date, c]) || []
    );

    // Build response items
    const items = (puzzles || []).map((p) => {
      const completion = completionMap.get(p.puzzle_date);
      return {
        date: p.puzzle_date,
        puzzle_id: p.id,
        completed: !!completion,
        duration_ms: completion?.duration_ms || null,
        mistakes: completion?.mistakes || null,
      };
    });

    const isPro = archiveDays > 7;

    return NextResponse.json({
      range: { from, to },
      items,
      entitlements: {
        archiveDays,
        isPro,
      },
    });
  } catch (error: any) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch archive' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
