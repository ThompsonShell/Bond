'use client';

import { useState } from 'react';
import { useCounts } from '@/components/shell/CountsProvider';
import { Icon, type IconName } from '@/components/icons';
import { Button, Card, EmptyState, H1, Tabs } from '@/components/ui';
import { cx } from '@/components/ui/cx';
import { api } from '@/lib/api';
import type { NotificationItem, NotificationKind } from '@/lib/types';
import ui from '@/components/ui/ui.module.css';
import s from './notifications.module.css';

const ICONS: Record<NotificationKind, IconName> = { match: 'spark', post: 'chat', event: 'calendarAlt' };

export function NotificationsView({ initial }: { initial: NotificationItem[] }) {
  const counts = useCounts();
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unread = items.filter((n) => !n.read).length;
  const shown = items.filter((n) => tab === 'all' || !n.read);

  async function read(id: string) {
    if (items.find((n) => n.id === id)?.read) return;
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await api.readNotification(id);
    counts.refresh();
  }

  async function readAll() {
    setItems(await api.readAllNotifications());
    counts.refresh();
  }

  return (
    <>
      <div className={s.head}>
        <H1>Bildirishnomalar</H1>
        {unread > 0 && (
          <Button variant="ghost" onClick={readAll}>
            Hammasini o’qilgan qilish
          </Button>
        )}
      </div>

      <Tabs
        label="Bildirishnomalar"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'Barchasi' },
          { id: 'unread', label: `O’qilmagan (${unread})` },
        ]}
      />

      {shown.length > 0 ? (
        <Card className={s.list}>
          {shown.map((n) => (
            <button key={n.id} type="button" className={cx(s.row, !n.read && s.unread)} onClick={() => read(n.id)}>
              <span className={s.tile}>
                <Icon name={ICONS[n.kind]} />
              </span>
              <span className={s.text}>
                <span className={s.title}>{n.text}</span>
                <span className={ui.meta}>{n.meta}</span>
              </span>
              {!n.read && <span className={s.dot} aria-label="O’qilmagan" />}
            </button>
          ))}
        </Card>
      ) : (
        <EmptyState title="Hammasi o’qilgan" text="Yangi bildirishnoma kelsa, shu yerda ko’rinadi." />
      )}
    </>
  );
}
