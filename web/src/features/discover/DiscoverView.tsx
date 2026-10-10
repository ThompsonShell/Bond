'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Card, ChipGroup, DateTile, H2, Meta, SearchBox, ToggleChip } from '@/components/ui';
import { api } from '@/lib/api';
import type { EventItem, Person } from '@/lib/types';
import s from './discover.module.css';

const TOPICS = ['Barchasi', 'AI', 'Python', 'Web Dev', 'Mobile', 'Flutter', 'UI/UX'] as const;

export function DiscoverView({ initialQuery, initialPeople, initialEvents }: { initialQuery: string; initialPeople: Person[]; initialEvents: EventItem[] }) {
  const [q, setQ] = useState(initialQuery);
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('Barchasi');
  const [people, setPeople] = useState(initialPeople);
  const [events, setEvents] = useState(initialEvents);
  const first = useRef(true);

  // Search box and topic chips filter both lists together.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      const [p, e] = await Promise.all([api.people(q, topic), api.events({ q, topic })]);
      if (alive) {
        setPeople(p);
        setEvents(e);
      }
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, topic]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(id: string) {
    const updated = await api.toggleRequest(id);
    setPeople((list) => list.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <>
      <SearchBox label="Odam yoki tadbir qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
      <ChipGroup label="Yo’nalish">
        {TOPICS.map((t) => (
          <ToggleChip key={t} tone="soft" pressed={t === topic} onToggle={() => setTopic(t)}>
            {t}
          </ToggleChip>
        ))}
      </ChipGroup>

      <div className={s.columns}>
        <Card className={s.people} aria-labelledby="discover-people">
          <div className={s.head}>
            <H2 small id="discover-people">
              Odamlar
            </H2>
            <Meta className={s.tabular}>{people.length} ta</Meta>
          </div>
          {people.map((p) => (
            <div key={p.id} className={s.row}>
              <Avatar initials={p.initials} size={40} />
              <div className={s.grow}>
                <div className={s.name}>{p.name}</div>
                <Meta className={s.ellipsis}>
                  {p.tags.join(', ')} · {p.extra}
                </Meta>
              </div>
              <button type="button" aria-pressed={p.requested} className={s.add} onClick={() => toggle(p.id)}>
                {p.requested ? 'So’rov yuborildi' : 'Qo’shish'}
              </button>
            </div>
          ))}
          {people.length === 0 && <Meta className={s.none}>Bu so’rov bo’yicha odam topilmadi. Boshqa yo’nalishni tanlab ko’ring.</Meta>}
        </Card>

        <Card className={s.events} aria-labelledby="discover-events">
          <div className={s.head}>
            <H2 small id="discover-events">
              Tadbirlar
            </H2>
            <Link href="/events" className={s.more}>
              Barchasi
            </Link>
          </div>
          {events.map((e) => (
            <div key={e.id} className={s.row}>
              <DateTile month={e.month} day={e.day} />
              <div style={{ minWidth: 0 }}>
                <div className={s.eventTitle}>{e.title}</div>
                <Meta>{e.place}</Meta>
              </div>
            </div>
          ))}
          {events.length === 0 && <Meta className={s.none}>Bu so’rov bo’yicha tadbir topilmadi.</Meta>}
        </Card>
      </div>
    </>
  );
}
