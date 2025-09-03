import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    // simple validation; also normalizes everything after the @
 
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  return NextResponse.json({ ok: false, error: 'Invalid email' 
}, { status: 400 });
}
 
(!email || 
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.replace(/.*@/, '@'))) {
      return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 });
    }

    const db = supabaseServer();
    const { error } = await db.from('subscribers').insert({ email });

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('duplicate') || m.includes('unique')) {
        return NextResponse.json({ ok: true, message: 'Already on the list' });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "🎉 You’re on the list!" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message || 'Unknown error' }, { status: 500 });
  }
}
