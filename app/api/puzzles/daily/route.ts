import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import { getUserEntitlements } from '@/lib/entitlements';
import { getTodayUTC } from '@/lib/dates';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = createClient();

    // Get date from query params (default to today)
    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get('date') || getTodayUTC();

    // Fetch the daily puzzle for the requested date
    const { data: puzzle, error } = await supabase
      .from('puzzles')
      .select('*')
      .eq('kind', 'daily')
      .eq('puzzle_date', requestedDate)
      .single();

    if (error || !puzzle) {
      return NextResponse.json(
        { error: 'Daily puzzle not found for this date' },
        { status: 404 }
      );
    }

    // Get user entitlements
    const entitlements = await getUserEntitlements(user.id);

    // Remove solution data (never send to client)
    const { solution_encrypted, ...safePuzzle } = puzzle;

    return NextResponse.json({
      puzzle: safePuzzle,
      entitlements: {
        isPro: entitlements.isPro,
        archiveDays: entitlements.archiveDays,
        practiceRemainingToday: entitlements.practiceRemainingToday,
      },
    });
  } catch (error: any) {
    console.error('Daily puzzle error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch daily puzzle' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
