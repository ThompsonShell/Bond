import { PageMain } from '@/components/shell/PageMain';
import { NotificationsView } from '@/features/notifications/NotificationsView';
import { getNotifications } from '@/lib/server/store';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bildirishnomalar · bondi' };

export default function NotificationsPage() {
  return (
    <PageMain narrow>
      <NotificationsView initial={getNotifications()} />
    </PageMain>
  );
}
