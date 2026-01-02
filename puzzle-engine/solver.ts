import { Grid, RuleCard, SymbolId } from './types';
import { SYMBOL_IDS } from './symbols';
import { validateRuleCard } from './ruleCards';

/**
 * Count the number of solutions for a puzzle (up to maxCount)
 * Returns count (stops early if exceeds maxCount for performance)
 */
export function countSolutions(
  ruleCards: RuleCard[],
  maxCount: number = 2
): number {
  const grid: Grid = Array(5)
    .fill(null)
    .map(() => Array(5).fill(''));

  let solutionCount = 0;

  function backtrack(row: number, col: number): boolean {
    // If we've exceeded maxCount, stop early
    if (solutionCount >= maxCount) {
      return true; // Stop searching
    }

    // If we've filled the entire grid
    if (row === 5) {
      // Validate all rule cards
      if (ruleCards.every((card) => validateRuleCard(grid, card))) {
        solutionCount++;
      }
      return solutionCount >= maxCount;
    }

    // Calculate next cell position
    const nextRow = col === 4 ? row + 1 : row;
    const nextCol = col === 4 ? 0 : col + 1;

    // Try each symbol
    for (const symbol of SYMBOL_IDS) {
      if (isValidPlacement(grid, row, col, symbol)) {
        grid[row][col] = symbol;

        if (backtrack(nextRow, nextCol)) {
          return true; // Stop if we've found enough solutions
        }

        grid[row][col] = ''; // Backtrack
      }
    }

    return false;
  }

  backtrack(0, 0);
  return solutionCount;
}

/**
 * Check if placing a symbol at (row, col) is valid for Latin square constraints
 * (doesn't check rule cards, only row/col uniqueness)
 */
function isValidPlacement(
  grid: Grid,
  row: number,
  col: number,
  symbol: SymbolId
): boolean {
  // Check if symbol already exists in this row
  for (let c = 0; c < 5; c++) {
    if (grid[row][c] === symbol) {
      return false;
    }
  }

  // Check if symbol already exists in this column
  for (let r = 0; r < 5; r++) {
    if (grid[r][col] === symbol) {
      return false;
    }
  }

  return true;
}

/**
 * Solve a puzzle and return one solution (if exists)
 * Returns null if no solution exists
 */
export function solvePuzzle(ruleCards: RuleCard[]): Grid | null {
  const grid: Grid = Array(5)
    .fill(null)
    .map(() => Array(5).fill(''));

  function backtrack(row: number, col: number): boolean {
    // If we've filled the entire grid
    if (row === 5) {
      // Validate all rule cards
      return ruleCards.every((card) => validateRuleCard(grid, card));
    }

    // Calculate next cell position
    const nextRow = col === 4 ? row + 1 : row;
    const nextCol = col === 4 ? 0 : col + 1;

    // Try each symbol
    for (const symbol of SYMBOL_IDS) {
      if (isValidPlacement(grid, row, col, symbol)) {
        grid[row][col] = symbol;

        if (backtrack(nextRow, nextCol)) {
          return true; // Solution found
        }

        grid[row][col] = ''; // Backtrack
      }
    }

    return false;
  }

  const solved = backtrack(0, 0);
  return solved ? grid : null;
}

/**
 * Verify that a given grid is a valid solution to the puzzle
 */
export function verifySolution(grid: Grid, ruleCards: RuleCard[]): boolean {
  // Check Latin square constraints
  for (let row = 0; row < 5; row++) {
    const rowSymbols = new Set(grid[row]);
    if (rowSymbols.size !== 5) return false;
  }

  for (let col = 0; col < 5; col++) {
    const colSymbols = new Set<SymbolId>();
    for (let row = 0; row < 5; row++) {
      colSymbols.add(grid[row][col]);
    }
    if (colSymbols.size !== 5) return false;
  }

  // Check all rule cards
  return ruleCards.every((card) => validateRuleCard(grid, card));
}

/**
 * Check if a puzzle has a unique solution
 */
export function hasUniqueSolution(ruleCards: RuleCard[]): boolean {
  return countSolutions(ruleCards, 2) === 1;
}
