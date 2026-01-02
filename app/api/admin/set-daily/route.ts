import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabaseServer';
import { generatePuzzle } from '@/puzzle-engine/generator';
import { RuleCardType } from '@/puzzle-engine/types';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { date, seed, difficulty = 3 } = body;

    if (!date || !seed) {
      return NextResponse.json(
        { error: 'Missing date or seed' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

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
    const { puzzle: generatedPuzzle } = generatePuzzle({
      seed,
      difficulty,
      enabledRules,
    });

    // Save as daily puzzle
    const { data: savedPuzzle, error: saveError } = await supabase
      .from('puzzles')
      .upsert({
        kind: 'daily',
        puzzle_date: date,
        seed: generatedPuzzle.seed,
        difficulty: generatedPuzzle.difficulty,
        symbols: generatedPuzzle.symbols,
        rule_cards: generatedPuzzle.rule_cards,
        solution_hash: generatedPuzzle.solution_hash,
      }, {
        onConflict: 'kind,puzzle_date'
      })
      .select()
      .single();

    if (saveError || !savedPuzzle) {
      throw saveError || new Error('Failed to save daily puzzle');
    }

    return NextResponse.json({
      ok: true,
      puzzle_id: savedPuzzle.id,
    });
  } catch (error: any) {
    console.error('Set daily puzzle error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set daily puzzle' },
      { status: error.message === 'Forbidden - Admin access required' ? 403 : 500 }
    );
  }
}
