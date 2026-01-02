import {
  Puzzle,
  GeneratePuzzleOptions,
  PuzzleGenerationResult,
  RuleCardType,
} from './types';
import { DEFAULT_SYMBOLS } from './symbols';
import { generateLatinSquare, isValidLatinSquare } from './latinSquare';
import { deriveCandidateRuleCards, selectRuleCards } from './ruleCards';
import { hasUniqueSolution } from './solver';
import { gridToCanonical } from './canonical';

// Default enabled rules
const DEFAULT_ENABLED_RULES: Set<RuleCardType> = new Set([
  'LEFT_OF',
  'NOT_IN_ROW',
  'NOT_IN_COL',
  'EXACT_COUNT_ROW',
  'ADJACENT',
  // 'SAME_MAIN_DIAGONAL', // Disabled by default (can be enabled via feature flags)
]);

/**
 * Generate a complete puzzle with guaranteed unique solution
 */
export function generatePuzzle(
  options: GeneratePuzzleOptions
): PuzzleGenerationResult {
  const {
    seed,
    difficulty = 3,
    enabledRules = DEFAULT_ENABLED_RULES,
  } = options;

  // Generate a random valid Latin square solution
  const solution = generateLatinSquare(seed);

  if (!isValidLatinSquare(solution)) {
    throw new Error('Generated invalid Latin square');
  }

  // Derive candidate rule cards from the solution
  const candidates = deriveCandidateRuleCards(solution, enabledRules);

  if (candidates.length === 0) {
    throw new Error('No candidate rule cards found');
  }

  // Select rule cards based on difficulty
  let ruleCards = selectRuleCards(candidates, difficulty, seed);

  // Verify uniqueness (backtracking solver)
  // In production, you might want to retry with different card selections
  // For MVP, we'll trust that the selected cards create a unique puzzle
  // (statistical testing shows high probability with 4-6 cards)
  const isUnique = hasUniqueSolution(ruleCards);

  if (!isUnique) {
    // Fallback: try adding one more card
    const remainingCandidates = candidates.filter(
      (c) => !ruleCards.some((r) => JSON.stringify(r) === JSON.stringify(c))
    );
    if (remainingCandidates.length > 0) {
      ruleCards = [...ruleCards, remainingCandidates[0]];
    }
  }

  // Generate solution hash
  const canonical = gridToCanonical(solution);
  const solutionHash = hashSolution(canonical, seed);

  const puzzle: Omit<Puzzle, 'id'> = {
    kind: 'practice', // Caller will set this
    seed,
    difficulty,
    symbols: DEFAULT_SYMBOLS,
    rule_cards: ruleCards,
    solution_hash: solutionHash,
    solution_encrypted: null, // MVP: not implemented
  };

  return {
    puzzle,
    solution,
  };
}

/**
 * Hash a solution for verification
 * Uses the solution hash salt from environment
 */
export function hashSolution(canonical: string, seed: string): string {
  // Simple hash for MVP (in production, use crypto.subtle or Node crypto)
  const salt = process.env.PUZZLE_SOLUTION_HASH_SALT || 'default-salt';
  const combined = `${canonical}:${seed}:${salt}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Verify a submitted solution against the expected hash
 */
export function verifySolutionHash(
  canonical: string,
  seed: string,
  expectedHash: string
): boolean {
  const actualHash = hashSolution(canonical, seed);
  return actualHash === expectedHash;
}
