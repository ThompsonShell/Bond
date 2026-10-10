import { handle, type IdParams } from '@/lib/server/http';
import { toggleGoing } from '@/lib/server/store';

export async function POST(_req: Request, { params }: IdParams) {
  const { id } = await params;
  return handle(() => toggleGoing(id));
}
