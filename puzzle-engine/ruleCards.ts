import {
  Grid,
  RuleCard,
  SymbolId,
  RuleCardType,
  LeftOfCard,
  NotInRowCard,
  NotInColCard,
  ExactCountRowCard,
  AdjacentCard,
  SameMainDiagonalCard,
} from './types';
import { findSymbolPositions } from './latinSquare';
import { SYMBOL_IDS } from './symbols';

/**
 * Validate if a rule card is satisfied by the given grid
 */
export function validateRuleCard(grid: Grid, card: RuleCard): boolean {
  switch (card.type) {
    case 'LEFT_OF':
      return validateLeftOf(grid, card);
    case 'NOT_IN_ROW':
      return validateNotInRow(grid, card);
    case 'NOT_IN_COL':
      return validateNotInCol(grid, card);
    case 'EXACT_COUNT_ROW':
      return validateExactCountRow(grid, card);
    case 'ADJACENT':
      return validateAdjacent(grid, card);
    case 'SAME_MAIN_DIAGONAL':
      return validateSameMainDiagonal(grid, card);
    default:
      return false;
  }
}

function validateLeftOf(grid: Grid, card: LeftOfCard): boolean {
  // Check if there exists at least one occurrence where A is left of B in the same row
  for (let row = 0; row < 5; row++) {
    const rowSymbols = grid[row];
    const aIndices = rowSymbols
      .map((s, i) => (s === card.a ? i : -1))
      .filter((i) => i !== -1);
    const bIndices = rowSymbols
      .map((s, i) => (s === card.b ? i : -1))
      .filter((i) => i !== -1);

    for (const aIdx of aIndices) {
      for (const bIdx of bIndices) {
        if (aIdx < bIdx) {
          return true;
        }
      }
    }
  }
  return false;
}

function validateNotInRow(grid: Grid, card: NotInRowCard): boolean {
  // Symbol A should not appear in the specified row
  return !grid[card.row].includes(card.a);
}

function validateNotInCol(grid: Grid, card: NotInColCard): boolean {
  // Symbol A should not appear in the specified column
  for (let row = 0; row < 5; row++) {
    if (grid[row][card.col] === card.a) {
      return false;
    }
  }
  return true;
}

function validateExactCountRow(grid: Grid, card: ExactCountRowCard): boolean {
  // Row should have exactly `count` occurrences of symbol A
  const count = grid[card.row].filter((s) => s === card.a).length;
  return count === card.count;
}

function validateAdjacent(grid: Grid, card: AdjacentCard): boolean {
  // Check if A and B are orthogonally adjacent anywhere in the grid
  const aPositions = findSymbolPositions(grid, card.a);
  const bPositions = findSymbolPositions(grid, card.b);

  for (const aPos of aPositions) {
    for (const bPos of bPositions) {
      // Check if orthogonally adjacent (Manhattan distance = 1)
      const rowDiff = Math.abs(aPos.row - bPos.row);
      const colDiff = Math.abs(aPos.col - bPos.col);
      if (rowDiff + colDiff === 1) {
        return true;
      }
    }
  }
  return false;
}

function validateSameMainDiagonal(
  grid: Grid,
  card: SameMainDiagonalCard
): boolean {
  // Check if two occurrences of symbol A are on the same main diagonal
  const positions = findSymbolPositions(grid, card.a);

  // In a Latin square, each symbol appears exactly once per row/col
  // So we have exactly 5 positions of symbol A
  // Check top-left to bottom-right diagonals
  const tlbrDiagonals = new Map<number, number>(); // key: row - col, value: count
  // Check top-right to bottom-left diagonals
  const trblDiagonals = new Map<number, number>(); // key: row + col, value: count

  for (const pos of positions) {
    const tlbrKey = pos.row - pos.col;
    const trblKey = pos.row + pos.col;

    tlbrDiagonals.set(tlbrKey, (tlbrDiagonals.get(tlbrKey) || 0) + 1);
    trblDiagonals.set(trblKey, (trblDiagonals.get(trblKey) || 0) + 1);
  }

  // Check if any diagonal has 2 or more occurrences
  for (const count of tlbrDiagonals.values()) {
    if (count >= 2) return true;
  }
  for (const count of trblDiagonals.values()) {
    if (count >= 2) return true;
  }

  return false;
}

/**
 * Derive candidate rule cards from a solution grid
 * Returns all possible valid rule cards that the solution satisfies
 */
export function deriveCandidateRuleCards(
  grid: Grid,
  enabledRules: Set<RuleCardType>
): RuleCard[] {
  const candidates: RuleCard[] = [];

  // LEFT_OF
  if (enabledRules.has('LEFT_OF')) {
    for (const a of SYMBOL_IDS) {
      for (const b of SYMBOL_IDS) {
        if (a === b) continue;
        const card: LeftOfCard = { type: 'LEFT_OF', a, b };
        if (validateRuleCard(grid, card)) {
          candidates.push(card);
        }
      }
    }
  }

  // NOT_IN_ROW
  if (enabledRules.has('NOT_IN_ROW')) {
    for (const a of SYMBOL_IDS) {
      for (let row = 0; row < 5; row++) {
        const card: NotInRowCard = { type: 'NOT_IN_ROW', a, row };
        if (validateRuleCard(grid, card)) {
          candidates.push(card);
        }
      }
    }
  }

  // NOT_IN_COL
  if (enabledRules.has('NOT_IN_COL')) {
    for (const a of SYMBOL_IDS) {
      for (let col = 0; col < 5; col++) {
        const card: NotInColCard = { type: 'NOT_IN_COL', a, col };
        if (validateRuleCard(grid, card)) {
          candidates.push(card);
        }
      }
    }
  }

  // EXACT_COUNT_ROW (for Latin square, count is always 0 or 1)
  if (enabledRules.has('EXACT_COUNT_ROW')) {
    for (const a of SYMBOL_IDS) {
      for (let row = 0; row < 5; row++) {
        const actualCount = grid[row].filter((s) => s === a).length;
        if (actualCount === 0 || actualCount === 1) {
          const card: ExactCountRowCard = {
            type: 'EXACT_COUNT_ROW',
            a,
            row,
            count: actualCount,
          };
          candidates.push(card);
        }
      }
    }
  }

  // ADJACENT
  if (enabledRules.has('ADJACENT')) {
    for (const a of SYMBOL_IDS) {
      for (const b of SYMBOL_IDS) {
        if (a === b) continue;
        const card: AdjacentCard = { type: 'ADJACENT', a, b };
        if (validateRuleCard(grid, card)) {
          candidates.push(card);
        }
      }
    }
  }

  // SAME_MAIN_DIAGONAL
  if (enabledRules.has('SAME_MAIN_DIAGONAL')) {
    for (const a of SYMBOL_IDS) {
      const card: SameMainDiagonalCard = { type: 'SAME_MAIN_DIAGONAL', a };
      if (validateRuleCard(grid, card)) {
        candidates.push(card);
      }
    }
  }

  return candidates;
}

/**
 * Select N rule cards based on difficulty
 * Higher difficulty = more complex/specific cards
 */
export function selectRuleCards(
  candidates: RuleCard[],
  difficulty: number,
  seed: string
): RuleCard[] {
  // Determine number of cards based on difficulty
  const cardCount = Math.min(4 + Math.floor(difficulty / 2), 6);

  // Simple seeded shuffle
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
  }

  const shuffled = [...candidates].sort((a, b) => {
    const aHash = (hash + JSON.stringify(a).length) % 1000;
    const bHash = (hash + JSON.stringify(b).length) % 1000;
    return aHash - bHash;
  });

  return shuffled.slice(0, Math.min(cardCount, shuffled.length));
}

/**
 * Get cells affected by a rule card (for hint highlighting)
 */
export function getAffectedCells(
  card: RuleCard
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = [];

  switch (card.type) {
    case 'LEFT_OF':
      // Entire grid is potentially affected
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          cells.push({ row, col });
        }
      }
      break;

    case 'NOT_IN_ROW':
      // Entire row is affected
      for (let col = 0; col < 5; col++) {
        cells.push({ row: card.row, col });
      }
      break;

    case 'NOT_IN_COL':
      // Entire column is affected
      for (let row = 0; row < 5; row++) {
        cells.push({ row, col: card.col });
      }
      break;

    case 'EXACT_COUNT_ROW':
      // Entire row is affected
      for (let col = 0; col < 5; col++) {
        cells.push({ row: card.row, col });
      }
      break;

    case 'ADJACENT':
    case 'SAME_MAIN_DIAGONAL':
      // Entire grid is potentially affected
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          cells.push({ row, col });
        }
      }
      break;
  }

  return cells;
}
