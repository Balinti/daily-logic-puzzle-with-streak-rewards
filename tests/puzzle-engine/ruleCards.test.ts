import { describe, it, expect } from 'vitest';
import { validateRuleCard, deriveCandidateRuleCards } from '@/puzzle-engine/ruleCards';
import { RuleCard } from '@/puzzle-engine/types';

describe('Rule Card Validation', () => {
  const testGrid = [
    ['A', 'B', 'C', 'D', 'E'],
    ['B', 'C', 'D', 'E', 'A'],
    ['C', 'D', 'E', 'A', 'B'],
    ['D', 'E', 'A', 'B', 'C'],
    ['E', 'A', 'B', 'C', 'D'],
  ];

  it('should validate LEFT_OF rule', () => {
    const card: RuleCard = { type: 'LEFT_OF', a: 'A', b: 'B' };
    expect(validateRuleCard(testGrid, card)).toBe(true);

    const invalidCard: RuleCard = { type: 'LEFT_OF', a: 'B', b: 'A' };
    expect(validateRuleCard(testGrid, invalidCard)).toBe(false);
  });

  it('should validate NOT_IN_ROW rule', () => {
    const card: RuleCard = { type: 'NOT_IN_ROW', a: 'B', row: 0 };
    expect(validateRuleCard(testGrid, card)).toBe(false); // B is in row 0

    const validCard: RuleCard = { type: 'NOT_IN_ROW', a: 'A', row: 1 };
    expect(validateRuleCard(testGrid, validCard)).toBe(false); // A is in row 1
  });

  it('should validate NOT_IN_COL rule', () => {
    const card: RuleCard = { type: 'NOT_IN_COL', a: 'B', col: 0 };
    expect(validateRuleCard(testGrid, card)).toBe(false); // B is in col 0

    const validCard: RuleCard = { type: 'NOT_IN_COL', a: 'A', col: 1 };
    expect(validateRuleCard(testGrid, validCard)).toBe(false); // A is in col 1
  });

  it('should validate EXACT_COUNT_ROW rule', () => {
    const card: RuleCard = { type: 'EXACT_COUNT_ROW', a: 'A', row: 0, count: 1 };
    expect(validateRuleCard(testGrid, card)).toBe(true); // A appears once in row 0

    const invalidCard: RuleCard = { type: 'EXACT_COUNT_ROW', a: 'A', row: 0, count: 2 };
    expect(validateRuleCard(testGrid, invalidCard)).toBe(false);
  });

  it('should validate ADJACENT rule', () => {
    const card: RuleCard = { type: 'ADJACENT', a: 'A', b: 'B' };
    expect(validateRuleCard(testGrid, card)).toBe(true); // A and B are adjacent
  });

  it('should derive candidate rule cards from a grid', () => {
    const enabledRules = new Set(['LEFT_OF', 'NOT_IN_ROW', 'NOT_IN_COL']);
    const candidates = deriveCandidateRuleCards(testGrid, enabledRules);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => validateRuleCard(testGrid, c))).toBe(true);
  });
});
