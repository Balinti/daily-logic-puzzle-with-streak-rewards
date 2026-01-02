import { Grid, SymbolId } from './types';
import { SYMBOL_IDS } from './symbols';

// Seeded random number generator (simple LCG)
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string seed to number
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    this.seed = Math.abs(hash);
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Generate a random valid 5×5 Latin square
 * Uses a seed for reproducibility
 */
export function generateLatinSquare(seed: string): Grid {
  const rng = new SeededRandom(seed);
  const size = 5;
  const grid: Grid = Array(size)
    .fill(null)
    .map(() => Array(size).fill(''));

  // Start with a canonical Latin square and permute
  // Base pattern: row i has symbols shifted by i positions
  const baseSymbols = [...SYMBOL_IDS];

  // Shuffle symbols for randomness
  const shuffledSymbols = rng.shuffle(baseSymbols);

  // Generate base Latin square with shifted rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      grid[row][col] = shuffledSymbols[(col + row) % size];
    }
  }

  // Apply random row swaps
  for (let i = 0; i < 10; i++) {
    const r1 = Math.floor(rng.next() * size);
    const r2 = Math.floor(rng.next() * size);
    [grid[r1], grid[r2]] = [grid[r2], grid[r1]];
  }

  // Apply random column swaps
  for (let i = 0; i < 10; i++) {
    const c1 = Math.floor(rng.next() * size);
    const c2 = Math.floor(rng.next() * size);
    for (let row = 0; row < size; row++) {
      [grid[row][c1], grid[row][c2]] = [grid[row][c2], grid[row][c1]];
    }
  }

  return grid;
}

/**
 * Validate that a grid is a valid Latin square
 */
export function isValidLatinSquare(grid: Grid): boolean {
  const size = 5;

  // Check each row has all symbols exactly once
  for (let row = 0; row < size; row++) {
    const seen = new Set(grid[row]);
    if (seen.size !== size || !SYMBOL_IDS.every((id) => seen.has(id))) {
      return false;
    }
  }

  // Check each column has all symbols exactly once
  for (let col = 0; col < size; col++) {
    const seen = new Set<SymbolId>();
    for (let row = 0; row < size; row++) {
      seen.add(grid[row][col]);
    }
    if (seen.size !== size || !SYMBOL_IDS.every((id) => seen.has(id))) {
      return false;
    }
  }

  return true;
}

/**
 * Find all positions of a symbol in the grid
 */
export function findSymbolPositions(
  grid: Grid,
  symbol: SymbolId
): Array<{ row: number; col: number }> {
  const positions: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === symbol) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}
