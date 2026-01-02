import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST() {
  try {
    const supabase = createClient();

    // Check if already authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Already authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return NextResponse.json({
        user: { id: user.id },
        session: { access_token: session?.access_token },
      });
    }

    // Sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      user: { id: data.user?.id },
      session: { access_token: data.session?.access_token },
    });
  } catch (error: any) {
    console.error('Anonymous auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
