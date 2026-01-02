import { describe, it, expect } from 'vitest';
import { solvePuzzle, verifySolution, hasUniqueSolution } from '@/puzzle-engine/solver';
import { generateLatinSquare } from '@/puzzle-engine/latinSquare';
import { RuleCard } from '@/puzzle-engine/types';

describe('Puzzle Solver', () => {
  it('should solve a simple puzzle', () => {
    const cards: RuleCard[] = [
      { type: 'NOT_IN_ROW', a: 'A', row: 0 },
      { type: 'NOT_IN_COL', a: 'B', col: 0 },
    ];

    const solution = solvePuzzle(cards);
    expect(solution).not.toBeNull();
  });

  it('should verify a valid solution', () => {
    const grid = generateLatinSquare('test-seed');
    const cards: RuleCard[] = [
      { type: 'LEFT_OF', a: 'A', b: 'B' },
    ];

    // Generate a solution that satisfies the cards
    const testGrid = [
      ['A', 'B', 'C', 'D', 'E'],
      ['B', 'C', 'D', 'E', 'A'],
      ['C', 'D', 'E', 'A', 'B'],
      ['D', 'E', 'A', 'B', 'C'],
      ['E', 'A', 'B', 'C', 'D'],
    ];

    const isValid = verifySolution(testGrid, cards);
    expect(isValid).toBe(true);
  });

  it('should detect invalid solution', () => {
    const cards: RuleCard[] = [
      { type: 'NOT_IN_ROW', a: 'A', row: 0 },
    ];

    // Grid that violates the rule
    const invalidGrid = [
      ['A', 'B', 'C', 'D', 'E'], // Has 'A' in row 0, violates rule
      ['B', 'C', 'D', 'E', 'A'],
      ['C', 'D', 'E', 'A', 'B'],
      ['D', 'E', 'A', 'B', 'C'],
      ['E', 'A', 'B', 'C', 'D'],
    ];

    const isValid = verifySolution(invalidGrid, cards);
    expect(isValid).toBe(false);
  });
});
