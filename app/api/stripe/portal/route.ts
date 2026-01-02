import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabaseServer';

export async function POST() {
  try {
    const user = await requireUser();
    const supabase = createClient();

    // Get Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
