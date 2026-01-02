import { AppHeader } from '@/components/AppHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Daily Puzzle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="1">1 - Easy</option>
                  <option value="2">2</option>
                  <option value="3" selected>3 - Medium</option>
                  <option value="4">4</option>
                  <option value="5">5 - Hard</option>
                </select>
              </div>
              <Button className="w-full">Generate & Set Daily</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly />
                  <span className="text-sm">LEFT_OF</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly />
                  <span className="text-sm">NOT_IN_ROW</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked readOnly />
                  <span className="text-sm">NOT_IN_COL</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" readOnly />
                  <span className="text-sm">SAME_MAIN_DIAGONAL</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
