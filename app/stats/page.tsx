import { AppHeader } from '@/components/AppHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={5} tokenBalance={2} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Stats</h1>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">5</p>
                  <p className="text-sm text-muted-foreground">Current</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Longest</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">2:34</p>
                  <p className="text-sm text-muted-foreground">Avg Time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">1.8</p>
                  <p className="text-sm text-muted-foreground">Avg Mistakes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-2">
                <span className="text-4xl font-bold">2</span>
                <span className="text-muted-foreground"> tokens available</span>
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Use to protect your streak if you miss a day
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
