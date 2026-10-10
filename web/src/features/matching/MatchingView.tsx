'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar, ButtonLink, Card, ChipGroup, EmptyState, H2, MatchPercent, Meta, ToggleChip } from '@/components/ui';
import { api } from '@/lib/api';
import type { Person } from '@/lib/types';
import s from './matching.module.css';

const FILTERS = ['Barchasi', 'AI', 'Mobile', 'UI/UX'] as const;

export function MatchingView({ initial }: { initial: Person[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Barchasi');
  const [people, setPeople] = useState(initial);

  async function pick(f: (typeof FILTERS)[number]) {
    setFilter(f);
    setPeople(await api.matches(f));
  }

  async function invite(id: string) {
    const updated = await api.toggleInvite(id);
    setPeople((list) => list.map((p) => (p.id === id ? updated : p)));
  }

  return (
    <>
      <ChipGroup label="Yo’nalish bo’yicha filtr">
        {FILTERS.map((f) => (
          <ToggleChip key={f} tone="soft" pressed={f === filter} onToggle={() => pick(f)}>
            {f}
          </ToggleChip>
        ))}
      </ChipGroup>

      {people.length === 0 ? (
        <EmptyState title="Mos sherik topilmadi" text="Boshqa yo’nalishni tanlab ko’ring." />
      ) : (
        <div className={s.grid}>
          {people.map((p) => (
            <Card as="article" key={p.id} className={s.card}>
              <div className={s.head}>
                <Avatar initials={p.initials} size={44} />
                <div className={s.grow}>
                  <H2>{p.name}</H2>
                  <Meta>{p.tags.join(', ')}</Meta>
                </div>
                <MatchPercent value={p.matchPercent} />
              </div>
              <ul className={s.reasons} aria-label="Moslik sabablari">
                {p.reasons.map((r) => (
                  <li key={r}>
                    <span className={s.check}>
                      <Icon name="check" />
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className={s.actions}>
                <button type="button" aria-pressed={p.invited} className={s.invite} onClick={() => invite(p.id)}>
                  {p.invited ? 'Taklif yuborildi' : 'Dars taklif qilish'}
                </button>
                <ButtonLink href={`/chats?c=${p.id}`} variant="secondary">
                  Yozish
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
