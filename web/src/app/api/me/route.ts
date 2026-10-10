import { handle, readJson } from '@/lib/server/http';
import { getUser, updateUser } from '@/lib/server/store';
import type { CurrentUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(() => getUser());
}

export async function PATCH(req: Request) {
  const body = await readJson<CurrentUser>(req);
  return handle(() => updateUser(body));
}
