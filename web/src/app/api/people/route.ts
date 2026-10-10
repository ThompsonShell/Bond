import { handle } from '@/lib/server/http';
import { searchPeople } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return handle(() => searchPeople(sp.get('q') ?? '', sp.get('topic') ?? 'Barchasi'));
}
