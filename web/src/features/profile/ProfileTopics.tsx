'use client';

import { useState } from 'react';
import { Card, ChipGroup, H2, Meta, ToggleChip } from '@/components/ui';
import { api } from '@/lib/api';
import { TOPICS, type Topic } from '@/lib/types';
import s from './profile.module.css';

/** Topics: click to add or remove; saved immediately. */
export function ProfileTopics({ initial }: { initial: Topic[] }) {
  const [picked, setPicked] = useState(initial);

  async function toggle(t: Topic) {
    const next = picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t];
    setPicked(next);
    const saved = await api.updateMe({ topics: next });
    setPicked(saved.topics);
  }

  return (
    <Card className={s.section}>
      <div>
        <H2>Yo’nalishlar</H2>
        <Meta>Mos sheriklar shu asosda tanlanadi. Bosib qo’shing yoki olib tashlang.</Meta>
      </div>
      <ChipGroup label="Yo’nalishlar">
        {TOPICS.map((t) => (
          <ToggleChip key={t} tone="soft" muted pressed={picked.includes(t)} onToggle={() => toggle(t)}>
            {t}
          </ToggleChip>
        ))}
      </ChipGroup>
    </Card>
  );
}
