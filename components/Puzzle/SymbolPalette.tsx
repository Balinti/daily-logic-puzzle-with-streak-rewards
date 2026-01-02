'use client';

import { cn } from '@/lib/utils';
import { Symbol, SymbolId } from '@/puzzle-engine/types';
import { Button } from '@/components/ui/button';

interface SymbolPaletteProps {
  symbols: Symbol[];
  onSymbolSelect: (symbolId: SymbolId) => void;
  selectedSymbol: SymbolId | null;
}

export function SymbolPalette({
  symbols,
  onSymbolSelect,
  selectedSymbol,
}: SymbolPaletteProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-sm text-muted-foreground text-center">Select a symbol</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {symbols.map((symbol) => (
          <Button
            key={symbol.id}
            variant={selectedSymbol === symbol.id ? 'default' : 'outline'}
            size="lg"
            onClick={() => onSymbolSelect(symbol.id)}
            className={cn(
              'w-16 h-16 text-3xl font-bold',
              selectedSymbol === symbol.id && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {symbol.glyph}
          </Button>
        ))}
        <Button
          variant="outline"
          size="lg"
          onClick={() => onSymbolSelect('' as SymbolId)}
          className="w-16 h-16 text-sm"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
