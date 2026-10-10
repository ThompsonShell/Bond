import { handle } from '@/lib/server/http';
import { markAllNotificationsRead } from '@/lib/server/store';

export function POST() {
  return handle(() => markAllNotificationsRead());
}
