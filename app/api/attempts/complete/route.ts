import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';
import { verifySolution } from '@/puzzle-engine/solver';
import { gridToCanonical } from '@/puzzle-engine/canonical';
import { verifySolutionHash } from '@/puzzle-engine/generator';
import { RuleCard } from '@/puzzle-engine/types';

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
    const { attempt_id, final_grid, duration_ms, mistakes, nudges_used, checks_used } = body;

    if (!attempt_id || !final_grid) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('*, puzzles(*)')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    const puzzle = attempt.puzzles;

    // Verify solution
    const isValid = verifySolution(final_grid, puzzle.rule_cards as RuleCard[]);

    if (!isValid) {
      // Update attempt as failed
      await supabase
        .from('attempts')
        .update({
          completed: false,
          result: 'fail',
          final_grid,
          duration_ms,
          mistakes,
          nudges_used,
          checks_used,
          completed_at: new Date().toISOString(),
        })
        .eq('id', attempt_id);

      return NextResponse.json(
        {
          result: 'fail',
          error: 'INVALID_SOLUTION',
        },
        { status: 400 }
      );
    }

    // Verify solution hash
    const canonical = gridToCanonical(final_grid);
    const hashValid = verifySolutionHash(canonical, puzzle.seed, puzzle.solution_hash);

    if (!hashValid) {
      return NextResponse.json(
        {
          result: 'fail',
          error: 'SOLUTION_HASH_MISMATCH',
        },
        { status: 400 }
      );
    }

    // Mark attempt as successful
    await supabase
      .from('attempts')
      .update({
        completed: true,
        result: 'success',
        final_grid,
        duration_ms,
        mistakes,
        nudges_used,
        checks_used,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt_id);

    let streakData = null;

    // If daily mode, update daily completions and streak
    if (attempt.mode === 'daily' && puzzle.puzzle_date) {
      // Insert daily completion
      await supabase.from('daily_completions').insert({
        user_id: user.id,
        puzzle_date: puzzle.puzzle_date,
        attempt_id: attempt.id,
        duration_ms,
        mistakes,
      });

      // Update streak
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const today = puzzle.puzzle_date;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      let newLongest = 1;

      if (streak) {
        if (streak.last_completed_date === yesterdayStr) {
          // Continuation of streak
          newStreak = streak.current_streak + 1;
        } else if (streak.last_completed_date === today) {
          // Already completed today (shouldn't happen, but handle it)
          newStreak = streak.current_streak;
        } else {
          // Streak broken
          newStreak = 1;
        }

        newLongest = Math.max(streak.longest_streak, newStreak);

        await supabase
          .from('streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_completed_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        // Create new streak
        await supabase.from('streaks').insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: today,
        });
      }

      streakData = {
        current: newStreak,
        longest: newLongest,
        last_completed_date: today,
      };
    }

    // Build response
    const response: any = {
      result: 'success',
    };

    if (streakData) {
      response.daily = {
        date: puzzle.puzzle_date,
        streak: streakData,
      };
      response.share = {
        text: `RuleGrid Daily ${puzzle.puzzle_date}\nTime: ${formatDuration(duration_ms)}\nMistakes: ${mistakes}\nDifficulty: ${puzzle.difficulty}/5`,
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Complete attempt error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete attempt' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
