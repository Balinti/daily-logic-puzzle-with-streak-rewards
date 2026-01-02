import { AppHeader } from '@/components/AppHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaywallPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upgrade to Pro</h1>
          <p className="text-muted-foreground">
            Unlock unlimited practice and premium features
          </p>
        </div>

        <div className="grid gap-4 mb-8">
          <Card className="border-primary border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pro Yearly</span>
                <span className="text-sm font-normal text-primary">Best Value</span>
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$39.99</span>
                <span className="text-muted-foreground"> / year</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Unlimited practice puzzles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  365-day archive access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  +5 Focus Tokens per month
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg">
                Subscribe Yearly
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Monthly</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$4.99</span>
                <span className="text-muted-foreground"> / month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Unlimited practice puzzles
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  365-day archive access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  +5 Focus Tokens per month
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" size="lg">
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime. All subscriptions renew automatically.
        </p>
      </main>
    </div>
  );
}
