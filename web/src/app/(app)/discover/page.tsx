import { PageMain } from '@/components/shell/PageMain';
import { H1 } from '@/components/ui';
import { DiscoverView } from '@/features/discover/DiscoverView';
import { getEvents, searchPeople } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Kashf etish · bondi' };

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q ?? '';
  return (
    <PageMain>
      <H1>Kashf etish</H1>
      <DiscoverView initialQuery={q} initialPeople={searchPeople(q)} initialEvents={getEvents({ q })} />
    </PageMain>
  );
}
