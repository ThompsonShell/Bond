import { handle, readJson } from '@/lib/server/http';
import { getSettings, updateSettings } from '@/lib/server/store';
import type { NotificationSettings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(() => getSettings());
}

export async function PATCH(req: Request) {
  const body = await readJson<NotificationSettings>(req);
  return handle(() => updateSettings(body));
}
