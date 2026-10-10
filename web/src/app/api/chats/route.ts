import { handle } from '@/lib/server/http';
import { getConversations } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(() => getConversations());
}
