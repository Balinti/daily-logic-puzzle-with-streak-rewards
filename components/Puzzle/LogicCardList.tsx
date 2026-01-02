'use client';

import { RuleCard, Symbol } from '@/puzzle-engine/types';
import { LogicCard } from './LogicCard';

interface LogicCardListProps {
  cards: RuleCard[];
  symbols: Symbol[];
}

export function LogicCardList({ cards, symbols }: LogicCardListProps) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-semibold text-muted-foreground">Logic Rules</h3>
      <div className="grid gap-2">
        {cards.map((card, index) => (
          <LogicCard key={index} card={card} symbols={symbols} />
        ))}
      </div>
    </div>
  );
}
