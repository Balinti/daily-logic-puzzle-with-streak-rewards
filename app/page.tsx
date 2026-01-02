import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={0} tokenBalance={2} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">RuleGrid</h1>
          <p className="text-muted-foreground">
            Daily logic puzzle with streaks
          </p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Daily Puzzle</CardTitle>
              <CardDescription>
                Complete today's puzzle to maintain your streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/daily">
                <Button size="lg" className="w-full">
                  Play Daily
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practice Mode</CardTitle>
              <CardDescription>
                10 free puzzles per day, or unlimited with Pro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/practice">
                <Button size="lg" variant="outline" className="w-full">
                  Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/archive">
              <Card className="hover:bg-accent cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl mb-2">📅</p>
                  <p className="font-semibold">Archive</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/stats">
              <Card className="hover:bg-accent cursor-pointer">
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl mb-2">📊</p>
                  <p className="font-semibold">Stats</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
