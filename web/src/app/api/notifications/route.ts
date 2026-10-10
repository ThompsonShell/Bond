import { handle } from '@/lib/server/http';
import { getNotifications } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(() => getNotifications());
}
