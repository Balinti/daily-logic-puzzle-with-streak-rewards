import { Symbol, SymbolId } from './types';

// Default symbol set for RuleGrid puzzles
export const DEFAULT_SYMBOLS: Symbol[] = [
  { id: 'A', label: 'Triangle', glyph: '▲' },
  { id: 'B', label: 'Circle', glyph: '●' },
  { id: 'C', label: 'Square', glyph: '■' },
  { id: 'D', label: 'Star', glyph: '★' },
  { id: 'E', label: 'Diamond', glyph: '◆' },
];

export const SYMBOL_IDS: SymbolId[] = DEFAULT_SYMBOLS.map((s) => s.id);

export function getSymbolById(id: SymbolId): Symbol | undefined {
  return DEFAULT_SYMBOLS.find((s) => s.id === id);
}
