import { NextResponse } from 'next/server';
import { readJson } from '@/lib/server/http';
import { isEmail } from '@/lib/server/store';

/** Mock: pretends to send a reset link. */
export async function POST(req: Request) {
  const { email = '' } = await readJson<{ email: string }>(req);
  const v = String(email).trim();
  if (!isEmail(v)) return NextResponse.json({ error: 'Email manzilini to’liq kiriting' }, { status: 400 });
  return NextResponse.json({ ok: true, email: v });
}
