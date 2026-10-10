import { NextResponse } from 'next/server';
import { readJson } from '@/lib/server/http';
import { isEmail, updateUser } from '@/lib/server/store';

/** Mock sign-up: stores name/email on the current (mock) user. */
export async function POST(req: Request) {
  const { name = '', email = '', password = '' } = await readJson<{ name: string; email: string; password: string }>(req);
  if (!String(name).trim()) return NextResponse.json({ error: 'Ismingizni kiriting' }, { status: 400 });
  if (!isEmail(String(email).trim())) return NextResponse.json({ error: 'Email manzilini to’liq kiriting' }, { status: 400 });
  if (String(password).length < 8) return NextResponse.json({ error: 'Parol kamida 8 ta belgi bo’lsin' }, { status: 400 });
  updateUser({ name: String(name), email: String(email) });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('bondi-session', 'mock', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
