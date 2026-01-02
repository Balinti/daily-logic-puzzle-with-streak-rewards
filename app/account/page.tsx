import { AppHeader } from '@/components/AppHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const isPro = false;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader streakCount={5} tokenBalance={2} />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Account</h1>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                {isPro ? 'Pro - Active' : 'Free Account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPro ? (
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              ) : (
                <Button className="w-full">Upgrade to Pro</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                Currently using anonymous account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Add Email (Magic Link)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className={isPro ? 'text-green-500' : 'text-muted-foreground'}>
                    {isPro ? '✓' : '○'}
                  </span>
                  Unlimited practice puzzles
                </li>
                <li className="flex items-center gap-2">
                  <span className={isPro ? 'text-green-500' : 'text-muted-foreground'}>
                    {isPro ? '✓' : '○'}
                  </span>
                  365-day archive access
                </li>
                <li className="flex items-center gap-2">
                  <span className={isPro ? 'text-green-500' : 'text-muted-foreground'}>
                    {isPro ? '✓' : '○'}
                  </span>
                  +5 extra Focus Tokens per month
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
