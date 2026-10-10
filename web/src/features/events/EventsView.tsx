'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, Card, DateTile, EmptyState, H2, Meta, Tabs } from '@/components/ui';
import { api } from '@/lib/api';
import type { EventItem } from '@/lib/types';
import s from './events.module.css';

type Tab = 'yaqin' | 'men';

export function EventsView({ initial }: { initial: EventItem[] }) {
  const [tab, setTab] = useState<Tab>('yaqin');
  const [events, setEvents] = useState(initial);
  const goingCount = events.filter((e) => e.going).length;
  const shown = events.filter((e) => tab === 'yaqin' || e.going);

  async function toggle(id: string) {
    const updated = await api.toggleGoing(id);
    setEvents((list) => list.map((e) => (e.id === id ? updated : e)));
  }

  return (
    <>
      <Tabs
        label="Tadbirlar"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'yaqin', label: 'Yaqin' },
          { id: 'men', label: `Men boradigan (${goingCount})` },
        ]}
      />

      {shown.map((e) => (
        <Card as="article" key={e.id} className={s.event}>
          <DateTile month={e.month} day={e.day} size="large" tone={e.going ? 'pos' : 'neutral'} />
          <div className={s.info}>
            <H2>{e.title}</H2>
            <Meta>
              {e.dateLabel} · {e.place}
            </Meta>
          </div>
          <button type="button" aria-pressed={e.going} className={s.go} onClick={() => toggle(e.id)}>
            {e.going && <Icon name="check" />}
            <span>{e.going ? 'Borasiz' : 'Boraman'}</span>
          </button>
        </Card>
      ))}

      {shown.length === 0 && (
        <EmptyState
          title="Hali tadbir tanlamadingiz"
          text="Borishni rejalashtirgan tadbirlaringiz shu yerda turadi."
          action={
            <Button variant="secondary" onClick={() => setTab('yaqin')}>
              Yaqin tadbirlarni ko’rish
            </Button>
          }
        />
      )}
    </>
  );
}
