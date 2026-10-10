import { handle, readJson } from '@/lib/server/http';
import { createPost, getPosts } from '@/lib/server/store';
import { FEED_TABS, type FeedTab } from '@/lib/types';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const tab = new URL(req.url).searchParams.get('tab') as FeedTab | null;
  return handle(() => getPosts(tab && FEED_TABS.includes(tab) ? tab : 'Barchasi'));
}

export async function POST(req: Request) {
  const body = await readJson<{ text: string }>(req);
  return handle(() => createPost(String(body.text ?? '')));
}
