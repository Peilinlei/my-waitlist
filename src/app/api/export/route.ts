import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (ADMIN_TOKEN && url.searchParams.get('token') !== ADMIN_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = supabaseServer();
  const { data, error } = await db
    .from('subscribers')
    .select('email, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const csv =
    'email,created_at\n' +
    (data ?? [])
      .map((r) => `${r.email},${new Date(r.created_at).toISOString()}`)
      .join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
    },
  });
}
