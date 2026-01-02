'use client';

import { RuleCard } from '@/puzzle-engine/types';
import { Card, CardContent } from '@/components/ui/card';

interface LogicCardProps {
  card: RuleCard;
  symbols: Array<{ id: string; label: string; glyph: string }>;
}

export function LogicCard({ card, symbols }: LogicCardProps) {
  const getSymbolGlyph = (id: string) => {
    return symbols.find((s) => s.id === id)?.glyph || id;
  };

  const renderCardText = () => {
    switch (card.type) {
      case 'LEFT_OF':
        return (
          <>
            <span className="text-2xl">{getSymbolGlyph(card.a)}</span> is left of{' '}
            <span className="text-2xl">{getSymbolGlyph(card.b)}</span>
          </>
        );
      case 'NOT_IN_ROW':
        return (
          <>
            No <span className="text-2xl">{getSymbolGlyph(card.a)}</span> in row {card.row + 1}
          </>
        );
      case 'NOT_IN_COL':
        return (
          <>
            No <span className="text-2xl">{getSymbolGlyph(card.a)}</span> in column {card.col + 1}
          </>
        );
      case 'EXACT_COUNT_ROW':
        return (
          <>
            Row {card.row + 1} has exactly {card.count}{' '}
            <span className="text-2xl">{getSymbolGlyph(card.a)}</span>
          </>
        );
      case 'ADJACENT':
        return (
          <>
            <span className="text-2xl">{getSymbolGlyph(card.a)}</span> adjacent to{' '}
            <span className="text-2xl">{getSymbolGlyph(card.b)}</span>
          </>
        );
      case 'SAME_MAIN_DIAGONAL':
        return (
          <>
            Two <span className="text-2xl">{getSymbolGlyph(card.a)}</span> on same diagonal
          </>
        );
      default:
        return 'Unknown rule';
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-3 text-sm font-medium text-center">
        {renderCardText()}
      </CardContent>
    </Card>
  );
}
