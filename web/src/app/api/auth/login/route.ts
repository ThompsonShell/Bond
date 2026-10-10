import { NextResponse } from 'next/server';
import { readJson } from '@/lib/server/http';
import { isEmail } from '@/lib/server/store';

/**
 * Mock sign-in: real authentication is not part of the design yet.
 * Accepts any well-formed email + password and sets a session cookie.
 */
export async function POST(req: Request) {
  const { email = '', password = '' } = await readJson<{ email: string; password: string }>(req);
  if (!isEmail(String(email).trim()) || !String(password)) {
    return NextResponse.json({ error: 'Email va parolni kiriting' }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('bondi-session', 'mock', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
