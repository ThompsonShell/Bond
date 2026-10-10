import { PageMain } from '@/components/shell/PageMain';
import { H1 } from '@/components/ui';
import { EventsView } from '@/features/events/EventsView';
import { getEvents } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tadbirlar · bondi' };

export default function EventsPage() {
  return (
    <PageMain narrow>
      <H1>Tadbirlar</H1>
      <EventsView initial={getEvents()} />
    </PageMain>
  );
}
