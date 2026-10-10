import { NextResponse } from 'next/server';
import { StoreError } from './store';

/** Runs a handler and maps store errors to JSON responses. */
export async function handle<T>(fn: () => T | Promise<T>): Promise<NextResponse> {
  try {
    return NextResponse.json(await fn());
  } catch (err) {
    if (err instanceof StoreError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Serverda xatolik' }, { status: 500 });
  }
}

export async function readJson<T extends object>(req: Request): Promise<Partial<T>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Partial<T>) : {};
  } catch {
    return {};
  }
}

export type IdParams = { params: Promise<{ id: string }> };
