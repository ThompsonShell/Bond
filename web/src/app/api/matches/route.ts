import { handle } from '@/lib/server/http';
import { getMatches } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const topic = new URL(req.url).searchParams.get('topic') ?? undefined;
  return handle(() => getMatches(topic));
}
