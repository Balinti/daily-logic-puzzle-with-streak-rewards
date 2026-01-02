'use client';

import { cn } from '@/lib/utils';
import { SymbolId } from '@/puzzle-engine/types';

interface RuleGridBoardProps {
  grid: (SymbolId | '')[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  symbols: Array<{ id: SymbolId; label: string; glyph: string }>;
  conflicts?: Set<string>; // Set of "row,col" strings
  highlightedCells?: Set<string>; // For hints
}

export function RuleGridBoard({
  grid,
  selectedCell,
  onCellClick,
  symbols,
  conflicts = new Set(),
  highlightedCells = new Set(),
}: RuleGridBoardProps) {
  const getSymbolGlyph = (symbolId: SymbolId | ''): string => {
    if (!symbolId) return '';
    return symbols.find((s) => s.id === symbolId)?.glyph || symbolId;
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="grid grid-cols-5 gap-1 bg-border p-2 rounded-lg">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex},${colIndex}`;
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const hasConflict = conflicts.has(key);
            const isHighlighted = highlightedCells.has(key);

            return (
              <button
                key={key}
                onClick={() => onCellClick(rowIndex, colIndex)}
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded transition-all',
                  'bg-background hover:bg-accent',
                  isSelected && 'ring-2 ring-primary ring-offset-2',
                  hasConflict && 'bg-destructive/20 text-destructive',
                  isHighlighted && 'bg-primary/20',
                  !cell && 'text-muted-foreground'
                )}
              >
                {getSymbolGlyph(cell)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
