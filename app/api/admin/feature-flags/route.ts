import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Missing key or value' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Update feature flag
    const { error } = await supabase
      .from('feature_flags')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Feature flags error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update feature flags' },
      { status: error.message === 'Forbidden - Admin access required' ? 403 : 500 }
    );
  }
}
