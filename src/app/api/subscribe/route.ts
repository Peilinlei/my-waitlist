import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';
cat > src/app/api/subscribe/route.ts <<'EOF'
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    // Tiny sanity check only — no strict regex:
    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Email required' }, { status: 400 });
    }

    const db = supabaseServer();
    const { error } = await db.from('subscribers').insert({ email });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('unique')) {
        return NextResponse.json({ ok: true, message: 'Already on the list' });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: '🎉 You’re on the list!' });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
