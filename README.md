# RuleGrid - Daily Logic Puzzle with Streak Rewards

A mobile-first daily micro logic puzzle game featuring a 5×5 Latin square with logic rule cards, streaks, Focus Tokens for miss protection, and Pro subscription for unlimited practice and extended archive access.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand (client), TanStack Query (server state)
- **Backend**: Next.js Route Handlers (serverless)
- **Database**: Supabase Postgres with RLS
- **Auth**: Supabase Auth (anonymous + magic link email)
- **Payments**: Stripe Billing (subscriptions)
- **Analytics**: PostHog
- **Error Monitoring**: Sentry
- **Rate Limiting**: Upstash Redis
- **PWA**: next-pwa
- **Deployment**: Vercel + Supabase + Upstash

## Game Mechanics

### RuleGrid Puzzle

- 5×5 grid with 5 symbols (Triangle, Circle, Square, Star, Diamond)
- Goal: Fill grid so each row/column contains each symbol exactly once (Latin square)
- Additionally satisfy 4–6 "logic cards" (rules) derived from the solution

### Logic Rule Cards

1. **LEFT_OF**: "A is left of B" (same row, any distance)
2. **NOT_IN_ROW**: "No A in row r"
3. **NOT_IN_COL**: "No A in col c"
4. **EXACT_COUNT_ROW**: "Row r has exactly k of symbol A"
5. **ADJACENT**: "A is orthogonally adjacent to B"
6. **SAME_MAIN_DIAGONAL**: "Two A are on the same main diagonal" (disabled by default)

### Monetization

**Free Tier:**
- Daily shared puzzle (1/day)
- Practice: 10 puzzles/day
- Archive: Last 7 days
- Focus Tokens: 2/month

**Pro ($4.99/mo, $39.99/yr):**
- Unlimited practice
- Archive: Last 365 days
- Extra Focus Tokens (+5/month)

### Streak System

- Streak increments when daily puzzle completed
- If you miss a day, spend 1 Focus Token to cover the missed day (within 7-day grace window)
- Focus Tokens preserve streaks without guilt

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account
- Stripe account
- Upstash Redis account (optional but recommended)
- PostHog account (optional)
- Sentry account (optional)

### 2. Clone and Install

```bash
git clone <your-repo>
cd daily-logic-puzzle
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at https://supabase.com

2. Run the database migrations:
   - Open SQL Editor in Supabase Dashboard
   - Run `/db/schema.sql` to create tables
   - Run `/db/rls.sql` to enable Row Level Security
   - (Optional) Run `/db/seed.sql` for test data

3. Get your Supabase credentials:
   - Project URL: `Settings > API > Project URL`
   - Anon key: `Settings > API > Project API keys > anon public`
   - Service role key: `Settings > API > Project API keys > service_role` (keep secret!)

4. Enable anonymous authentication:
   - Go to `Authentication > Providers`
   - Enable "Anonymous sign-ins"

5. (Optional) Set up email magic link:
   - Configure email provider in `Authentication > Email Templates`

### 4. Stripe Setup

1. Create a Stripe account at https://stripe.com

2. Create products and prices:
   - Go to `Products > Add product`
   - Create "RuleGrid Pro Monthly" - Recurring: $4.99/month
   - Create "RuleGrid Pro Yearly" - Recurring: $39.99/year
   - Copy the Price IDs (e.g., `price_xxx`)

3. Get API keys:
   - `Developers > API keys`
   - Copy Secret key and Publishable key

4. Set up webhook endpoint:
   - For local development: Use Stripe CLI (see below)
   - For production:
     - `Developers > Webhooks > Add endpoint`
     - URL: `https://yourdomain.com/api/stripe/webhook`
     - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
     - Copy webhook signing secret

### 5. Stripe CLI for Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
npm run stripe:listen

# This will output a webhook signing secret (whsec_xxx) - add to .env.local
```

### 6. Upstash Redis Setup (Optional)

1. Create account at https://upstash.com
2. Create a new Redis database
3. Copy REST URL and REST Token from dashboard

### 7. PostHog Setup (Optional)

1. Create account at https://posthog.com
2. Create new project
3. Copy Project API Key

### 8. Sentry Setup (Optional)

1. Create account at https://sentry.io
2. Create new Next.js project
3. Copy DSN

### 9. Environment Variables

Create `.env.local` in the root directory:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local
```

Fill in all values:

```env
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Upstash Redis (optional)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Admin
ADMIN_EMAIL_ALLOWLIST=admin@example.com

# Security
PUZZLE_SOLUTION_HASH_SALT=your-random-salt-change-in-production

# PWA
NEXT_PUBLIC_PWA_ENABLED=false
```

### 10. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 11. Admin Setup

1. Create an account using anonymous or email sign-in
2. Find your user ID in Supabase `auth.users` table
3. Run in Supabase SQL Editor:
   ```sql
   UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
   ```
4. Access admin panel at `/admin`
5. Generate the first daily puzzle

### 12. Run Tests

```bash
# Unit tests
npm test

# E2E tests (make sure dev server is running)
npm run test:e2e
```

### 13. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add all environment variables from `.env.local`
4. Deploy
5. Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain
6. Update Stripe webhook URL to `https://yourdomain.vercel.app/api/stripe/webhook`
7. Update Supabase redirect URLs in `Authentication > URL Configuration`

### Post-Deployment Tasks

1. **Set up daily puzzle generation**:
   - Use admin panel (`/admin`) to generate daily puzzles
   - Or set up a cron job to call `/api/admin/set-daily` daily

2. **Grant monthly Focus Tokens**:
   - Create a cron job that inserts records into `focus_token_ledger` table monthly
   - Free users: 2 tokens (`monthly_grant_free`)
   - Pro users: 7 tokens (2 + 5, `monthly_grant_pro`)

3. **Monitor Stripe webhook events** in Stripe Dashboard

4. **Set up database backups** in Supabase

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── daily/             # Daily puzzle page
│   ├── practice/          # Practice mode page
│   ├── archive/           # Archive page
│   ├── stats/             # Stats page
│   ├── account/           # Account & subscription page
│   ├── paywall/           # Pricing page
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── Puzzle/           # Puzzle-specific components
├── lib/                  # Utilities
│   ├── supabaseClient.ts
│   ├── supabaseServer.ts
│   ├── auth.ts
│   ├── entitlements.ts
│   ├── stripe.ts
│   ├── posthog.ts
│   ├── sentry.ts
│   └── rateLimit.ts
├── puzzle-engine/        # Core puzzle logic
│   ├── types.ts
│   ├── symbols.ts
│   ├── latinSquare.ts
│   ├── ruleCards.ts
│   ├── solver.ts
│   ├── canonical.ts
│   └── generator.ts
├── db/                   # Database migrations
│   ├── schema.sql
│   ├── rls.sql
│   └── seed.sql
└── tests/               # Tests
    ├── puzzle-engine/
    └── e2e/
```

## Key Features Implemented

- ✅ Puzzle generation with unique solution guarantee
- ✅ Seeded reproducibility (same seed = same puzzle)
- ✅ Complete API for puzzles, attempts, streaks
- ✅ Stripe subscription integration with webhook handling
- ✅ Practice quota gating (10/day free)
- ✅ Archive access gating (7 days free, 365 Pro)
- ✅ Focus Token system for streak protection
- ✅ Row Level Security (RLS) on all tables
- ✅ Anonymous + email authentication
- ✅ Rate limiting on API endpoints
- ✅ Mobile-first responsive UI
- ✅ PWA support
- ✅ Analytics (PostHog) and error monitoring (Sentry)
- ✅ Unit tests for puzzle engine
- ✅ E2E smoke tests

## Puzzle Generation Algorithm

1. Generate random valid 5×5 Latin square (using seed)
2. Derive candidate rule cards from solution
3. Select 4–6 cards based on difficulty
4. Verify uniqueness of solution using backtracking solver
5. Hash solution for verification
6. Store puzzle with metadata

## Future Enhancements

- [ ] Implement actual puzzle-solving UI with state management (Zustand)
- [ ] Add hint system (nudge highlighting)
- [ ] Implement timer and mistake tracking in UI
- [ ] Add proper error handling and user feedback
- [ ] Implement real-time leaderboards
- [ ] Add difficulty progression algorithm
- [ ] Implement Focus Token earning mechanics
- [ ] Add tutorial/onboarding flow
- [ ] Optimize puzzle generation for guaranteed uniqueness
- [ ] Add more rule card types
- [ ] Implement puzzle sharing with friends
- [ ] Add achievements system

## Contributing

This is a complete MVP implementation. Feel free to extend it with additional features!

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
