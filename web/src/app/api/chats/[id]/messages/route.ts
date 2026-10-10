import { handle, readJson, type IdParams } from '@/lib/server/http';
import { sendMessage } from '@/lib/server/store';

export async function POST(req: Request, { params }: IdParams) {
  const { id } = await params;
  const body = await readJson<{ text: string }>(req);
  return handle(() => sendMessage(id, String(body.text ?? '')));
}
