// Core puzzle types for RuleGrid

export type SymbolId = string; // 'A' | 'B' | 'C' | 'D' | 'E'

export interface Symbol {
  id: SymbolId;
  label: string;
  glyph: string;
}

export type Grid = SymbolId[][]; // 5x5 grid

export type RuleCardType =
  | 'LEFT_OF'
  | 'NOT_IN_ROW'
  | 'NOT_IN_COL'
  | 'EXACT_COUNT_ROW'
  | 'ADJACENT'
  | 'SAME_MAIN_DIAGONAL';

export interface BaseRuleCard {
  type: RuleCardType;
}

export interface LeftOfCard extends BaseRuleCard {
  type: 'LEFT_OF';
  a: SymbolId;
  b: SymbolId;
}

export interface NotInRowCard extends BaseRuleCard {
  type: 'NOT_IN_ROW';
  a: SymbolId;
  row: number; // 0-4
}

export interface NotInColCard extends BaseRuleCard {
  type: 'NOT_IN_COL';
  a: SymbolId;
  col: number; // 0-4
}

export interface ExactCountRowCard extends BaseRuleCard {
  type: 'EXACT_COUNT_ROW';
  a: SymbolId;
  row: number; // 0-4
  count: number;
}

export interface AdjacentCard extends BaseRuleCard {
  type: 'ADJACENT';
  a: SymbolId;
  b: SymbolId;
}

export interface SameMainDiagonalCard extends BaseRuleCard {
  type: 'SAME_MAIN_DIAGONAL';
  a: SymbolId;
}

export type RuleCard =
  | LeftOfCard
  | NotInRowCard
  | NotInColCard
  | ExactCountRowCard
  | AdjacentCard
  | SameMainDiagonalCard;

export interface Puzzle {
  id?: string;
  kind: 'daily' | 'practice';
  puzzle_date?: string; // YYYY-MM-DD
  seed: string;
  difficulty: number; // 1-5
  symbols: Symbol[];
  rule_cards: RuleCard[];
  solution_hash: string;
  solution_encrypted?: string | null;
}

export interface GeneratePuzzleOptions {
  seed: string;
  difficulty?: number; // 1-5, default 3
  enabledRules?: Set<RuleCardType>;
}

export interface PuzzleGenerationResult {
  puzzle: Omit<Puzzle, 'id'>;
  solution: Grid; // For verification/testing only, not sent to client
}
