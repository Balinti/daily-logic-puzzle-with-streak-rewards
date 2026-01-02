'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PaywallCard } from '@/components/PaywallCard';

export default function PracticePage() {
  const [quotaRemaining] = useState(6);
  const [isPro] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={5} tokenBalance={2} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Practice Mode</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Puzzles Remaining Today</CardTitle>
            <CardDescription>
              {isPro ? 'Unlimited' : `${quotaRemaining} / 10 free puzzles`}
            </CardDescription>
          </CardHeader>
        </Card>

        {quotaRemaining > 0 || isPro ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline">Auto (Recommended)</Button>
              <Button variant="outline">Easy (1/5)</Button>
              <Button variant="outline">Medium (3/5)</Button>
              <Button variant="outline">Hard (5/5)</Button>
            </CardContent>
          </Card>
        ) : (
          <PaywallCard
            title="Daily Quota Reached"
            description="You've used all 10 free practice puzzles for today. Upgrade to Pro for unlimited practice!"
          />
        )}
      </main>
    </div>
  );
}
