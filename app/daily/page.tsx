'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { RuleGridBoard } from '@/components/Puzzle/RuleGridBoard';
import { SymbolPalette } from '@/components/Puzzle/SymbolPalette';
import { LogicCardList } from '@/components/Puzzle/LogicCardList';
import { CompletionModal } from '@/components/Puzzle/CompletionModal';
import { Button } from '@/components/ui/button';
import { DEFAULT_SYMBOLS } from '@/puzzle-engine/symbols';

export default function DailyPage() {
  const [grid, setGrid] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Demo rule cards
  const demoCards = [
    { type: 'LEFT_OF' as const, a: 'A', b: 'B' },
    { type: 'NOT_IN_COL' as const, a: 'C', col: 2 },
  ];

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleSymbolSelect = (symbolId: string) => {
    setSelectedSymbol(symbolId);

    if (selectedCell) {
      const newGrid = grid.map((r) => [...r]);
      newGrid[selectedCell.row][selectedCell.col] = symbolId;
      setGrid(newGrid);
    }
  };

  const handleCheck = () => {
    // Demo: just show completion modal
    setIsComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={5} tokenBalance={2} />

      <main className="container mx-auto px-4 py-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Daily Puzzle</h1>

        <LogicCardList cards={demoCards} symbols={DEFAULT_SYMBOLS} />

        <RuleGridBoard
          grid={grid}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          symbols={DEFAULT_SYMBOLS}
        />

        <SymbolPalette
          symbols={DEFAULT_SYMBOLS}
          onSymbolSelect={handleSymbolSelect}
          selectedSymbol={selectedSymbol}
        />

        <div className="flex gap-2 p-4">
          <Button onClick={handleCheck} className="flex-1">
            Check Solution
          </Button>
        </div>
      </main>

      <CompletionModal
        open={isComplete}
        onClose={() => setIsComplete(false)}
        stats={{ duration_ms: 125000, mistakes: 2, difficulty: 3 }}
        shareText="RuleGrid Daily 2026-01-02"
      />
    </div>
  );
}
