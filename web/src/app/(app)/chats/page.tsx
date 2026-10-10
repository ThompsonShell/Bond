import { PageMain } from '@/components/shell/PageMain';
import { H1 } from '@/components/ui';
import { ChatsView } from '@/features/chats/ChatsView';
import { getConversations, openConversation } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Chatlar · bondi' };

export default async function ChatsPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const before = getConversations();
  const id = before.find((x) => x.personId === c)?.personId ?? before[0]?.personId ?? null;
  // Opening a conversation marks it read.
  const thread = id ? openConversation(id) : [];
  return (
    <PageMain>
      <H1>Chatlar</H1>
      <ChatsView initialList={getConversations()} initialId={id} initialThread={thread} />
    </PageMain>
  );
}
