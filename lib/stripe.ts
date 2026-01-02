import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_PRO_MONTHLY_PRICE_ID =
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '';
export const STRIPE_PRO_YEARLY_PRICE_ID =
  process.env.STRIPE_PRO_YEARLY_PRICE_ID || '';
