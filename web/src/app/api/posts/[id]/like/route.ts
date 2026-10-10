import { handle, type IdParams } from '@/lib/server/http';
import { toggleLike } from '@/lib/server/store';

export async function POST(_req: Request, { params }: IdParams) {
  const { id } = await params;
  return handle(() => toggleLike(id));
}
