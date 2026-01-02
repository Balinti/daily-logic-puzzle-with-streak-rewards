import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { requireUser } from '@/lib/auth';
import {
  isPro,
  getPracticeQuotaRemaining,
  incrementPracticeQuota,
} from '@/lib/entitlements';
import { generatePuzzle } from '@/puzzle-engine/generator';
import { rateLimiters, checkRateLimit } from '@/lib/rateLimit';
import { RuleCardType } from '@/puzzle-engine/types';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    // Rate limiting
    const { success } = await checkRateLimit(
      rateLimiters.practice,
      user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const difficultyParam = searchParams.get('difficulty') || 'auto';

    // Check Pro status
    const userIsPro = await isPro(user.id);

    // Check quota for free users
    if (!userIsPro) {
      const remaining = await getPracticeQuotaRemaining(user.id, false);

      if (remaining <= 0) {
        return NextResponse.json(
          {
            error: 'PRACTICE_QUOTA_EXCEEDED',
            quota: {
              limit: 10,
              used: 10,
              remaining: 0,
              isPro: false,
            },
            paywall: {
              cta: 'Upgrade to Pro for unlimited practice.',
            },
          },
          { status: 402 }
        );
      }
    }

    // Determine difficulty
    let difficulty = 3;
    if (difficultyParam !== 'auto') {
      difficulty = Math.max(1, Math.min(5, parseInt(difficultyParam, 10) || 3));
    }

    // Get enabled rule cards from feature flags
    const { data: flagData } = await supabase
      .from('feature_flags')
      .select('value')
      .eq('key', 'rule_cards_enabled')
      .single();

    const enabledRulesObj = flagData?.value || {};
    const enabledRules = new Set<RuleCardType>(
      Object.entries(enabledRulesObj)
        .filter(([_, enabled]) => enabled === true)
        .map(([rule]) => rule as RuleCardType)
    );

    // Generate puzzle
    const seed = `practice-${user.id}-${Date.now()}-${Math.random()}`;
    const { puzzle: generatedPuzzle } = generatePuzzle({
      seed,
      difficulty,
      enabledRules,
    });

    // Save puzzle to database
    const { data: savedPuzzle, error: saveError } = await supabase
      .from('puzzles')
      .insert({
        kind: 'practice',
        seed: generatedPuzzle.seed,
        difficulty: generatedPuzzle.difficulty,
        symbols: generatedPuzzle.symbols,
        rule_cards: generatedPuzzle.rule_cards,
        solution_hash: generatedPuzzle.solution_hash,
      })
      .select()
      .single();

    if (saveError || !savedPuzzle) {
      throw new Error('Failed to save puzzle');
    }

    // Increment quota for free users
    if (!userIsPro) {
      await incrementPracticeQuota(user.id);
    }

    const remaining = await getPracticeQuotaRemaining(user.id, userIsPro);

    return NextResponse.json({
      puzzle: savedPuzzle,
      quota: {
        limit: 10,
        used: userIsPro ? 0 : 10 - (remaining || 0),
        remaining: userIsPro ? Infinity : remaining,
        isPro: userIsPro,
      },
    });
  } catch (error: any) {
    console.error('Practice puzzle error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate practice puzzle' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
