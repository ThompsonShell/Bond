import { handle, type IdParams } from '@/lib/server/http';
import { openConversation } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

/** Returns the thread and marks the conversation as read. */
export async function GET(_req: Request, { params }: IdParams) {
  const { id } = await params;
  return handle(() => openConversation(id));
}
