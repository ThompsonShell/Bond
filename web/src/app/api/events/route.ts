import { handle } from '@/lib/server/http';
import { getEvents } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return handle(() =>
    getEvents({ q: sp.get('q') ?? '', topic: sp.get('topic') ?? 'Barchasi', going: sp.get('going') === '1' }),
  );
}
