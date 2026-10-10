import { handle, type IdParams } from '@/lib/server/http';
import { toggleInvite } from '@/lib/server/store';

export async function POST(_req: Request, { params }: IdParams) {
  const { id } = await params;
  return handle(() => toggleInvite(id));
}
