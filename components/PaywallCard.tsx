'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PaywallCardProps {
  title?: string;
  description?: string;
  cta?: string;
}

export function PaywallCard({
  title = 'Upgrade to Pro',
  description = 'Unlock unlimited practice, 365-day archive, and extra Focus Tokens.',
  cta = 'See Plans',
}: PaywallCardProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/paywall" className="w-full">
          <Button className="w-full">{cta}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
