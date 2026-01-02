'use client';

import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!key) {
    console.warn('PostHog key not configured');
    return;
  }

  posthog.init(key, {
    api_host: host,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing();
      }
    },
  });
}

export { posthog };

// Event tracking helpers
export const trackEvent = {
  puzzleView: (kind: string, difficulty: number) => {
    posthog.capture('puzzle_view', { kind, difficulty });
  },
  puzzleStart: (kind: string, puzzleId: string) => {
    posthog.capture('puzzle_start', { kind, puzzle_id: puzzleId });
  },
  puzzleComplete: (
    kind: string,
    puzzleId: string,
    durationMs: number,
    mistakes: number
  ) => {
    posthog.capture('puzzle_complete', {
      kind,
      puzzle_id: puzzleId,
      duration_ms: durationMs,
      mistakes,
    });
  },
  practiceQuotaExceeded: () => {
    posthog.capture('practice_quota_exceeded');
  },
  paywallView: (source: string) => {
    posthog.capture('paywall_view', { source });
  },
  subscribeClick: (priceId: string) => {
    posthog.capture('subscribe_click', { price_id: priceId });
  },
  subscribeSuccess: (priceId: string) => {
    posthog.capture('subscribe_success', { price_id: priceId });
  },
  focusTokenUseAttempt: (coverDate: string) => {
    posthog.capture('focus_token_use_attempt', { cover_date: coverDate });
  },
  focusTokenUsed: (coverDate: string, balance: number) => {
    posthog.capture('focus_token_used', { cover_date: coverDate, balance });
  },
};
