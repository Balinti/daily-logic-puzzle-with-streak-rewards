'use client';

import Link from 'next/link';

interface AppHeaderProps {
  streakCount?: number;
  tokenBalance?: number;
}

export function AppHeader({ streakCount, tokenBalance }: AppHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          RuleGrid
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {streakCount !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-lg">🔥</span>
              <span className="font-semibold">{streakCount}</span>
            </div>
          )}
          {tokenBalance !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span className="font-semibold">{tokenBalance}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
