import { describe, it, expect } from 'vitest';
import { generatePuzzle } from '@/puzzle-engine/generator';
import { isValidLatinSquare } from '@/puzzle-engine/latinSquare';
import { verifySolution } from '@/puzzle-engine/solver';

describe('Puzzle Generator', () => {
  it('should generate a valid puzzle', () => {
    const result = generatePuzzle({
      seed: 'test-seed-1',
      difficulty: 3,
    });

    expect(result.puzzle).toBeDefined();
    expect(result.solution).toBeDefined();
    expect(result.puzzle.symbols).toHaveLength(5);
    expect(result.puzzle.rule_cards.length).toBeGreaterThan(0);
  });

  it('should generate a valid Latin square solution', () => {
    const result = generatePuzzle({
      seed: 'test-seed-2',
      difficulty: 3,
    });

    expect(isValidLatinSquare(result.solution)).toBe(true);
  });

  it('should generate a solution that satisfies all rule cards', () => {
    const result = generatePuzzle({
      seed: 'test-seed-3',
      difficulty: 3,
    });

    const isValid = verifySolution(result.solution, result.puzzle.rule_cards);
    expect(isValid).toBe(true);
  });

  it('should produce the same puzzle for the same seed', () => {
    const seed = 'reproducible-seed';
    const result1 = generatePuzzle({ seed, difficulty: 3 });
    const result2 = generatePuzzle({ seed, difficulty: 3 });

    expect(result1.puzzle.solution_hash).toBe(result2.puzzle.solution_hash);
  });

  it('should generate different puzzles for different seeds', () => {
    const result1 = generatePuzzle({ seed: 'seed-a', difficulty: 3 });
    const result2 = generatePuzzle({ seed: 'seed-b', difficulty: 3 });

    expect(result1.puzzle.solution_hash).not.toBe(result2.puzzle.solution_hash);
  });
});
