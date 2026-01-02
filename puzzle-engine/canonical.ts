import { Grid } from './types';

/**
 * Convert a grid to a canonical string representation
 * Used for solution hashing
 */
export function gridToCanonical(grid: Grid): string {
  return grid.map((row) => row.join('')).join('|');
}

/**
 * Parse a canonical string back to a grid
 */
export function canonicalToGrid(canonical: string): Grid {
  return canonical.split('|').map((row) => row.split(''));
}

/**
 * Normalize a grid to its canonical form
 * (Useful for comparing solutions that are equivalent under transformations)
 * For MVP, we just use the grid as-is
 */
export function normalizeGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}
