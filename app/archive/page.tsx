import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function ArchivePage() {
  // Demo data
  const archiveDays = [
    { date: '2026-01-02', completed: true, duration: '2:15', mistakes: 1 },
    { date: '2026-01-01', completed: true, duration: '3:42', mistakes: 3 },
    { date: '2025-12-31', completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={5} tokenBalance={2} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Archive</h1>

        <p className="text-sm text-muted-foreground mb-4">
          Last 7 days (Upgrade to Pro for 365-day archive)
        </p>

        <div className="grid gap-2">
          {archiveDays.map((day) => (
            <Card key={day.date} className="hover:bg-accent cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{day.date}</p>
                  {day.completed && (
                    <p className="text-sm text-muted-foreground">
                      {day.duration} • {day.mistakes} mistakes
                    </p>
                  )}
                </div>
                {day.completed ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
