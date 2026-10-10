import { handle, readJson } from '@/lib/server/http';
import { clearJournalToday, getJournal, saveJournal } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export function GET() {
  return handle(() => getJournal());
}

export async function POST(req: Request) {
  const body = await readJson<{ mood: string; note: string }>(req);
  return handle(() => saveJournal(String(body.mood ?? ''), String(body.note ?? '')));
}

/** "Edit" button: reopen today's entry for editing. */
export function DELETE() {
  return handle(() => clearJournalToday());
}
