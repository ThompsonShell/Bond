'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, ChipGroup, Field, H1, InlineError, Meta, ToggleChip } from '@/components/ui';
import { api } from '@/lib/api';
import { TOPICS, type Topic } from '@/lib/types';
import { Steps } from './Steps';
import s from './auth.module.css';

export function OnboardingTopics({ initialTopics, initialUniversity }: { initialTopics: Topic[]; initialUniversity: string }) {
  const router = useRouter();
  const [picked, setPicked] = useState<Topic[]>(initialTopics);
  const [university, setUniversity] = useState(initialUniversity);
  const [error, setError] = useState(false);

  const toggle = (t: Topic) => {
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
    setError(false);
  };

  async function next() {
    if (picked.length === 0) return setError(true);
    await api.updateMe({ topics: picked, university });
    router.push('/onboarding/2');
  }

  return (
    <>
      <Steps current={1} total={2} />
      <div>
        <H1>Nimani o’rganyapsiz?</H1>
        <Meta style={{ fontSize: 14 }}>Kamida bitta yo’nalish tanlang. Shunga qarab sherik tavsiya qilamiz.</Meta>
      </div>
      <ChipGroup wide label="Yo’nalishlar">
        {TOPICS.map((t) => (
          <ToggleChip key={t} pressed={picked.includes(t)} onToggle={() => toggle(t)}>
            {t}
          </ToggleChip>
        ))}
      </ChipGroup>
      <Field label="Universitet" id="ob-uni" type="text" placeholder="Masalan, INHA" value={university} onChange={(e) => setUniversity(e.target.value)} />
      {error && <InlineError>Avval kamida bitta yo’nalish tanlang</InlineError>}
      <div className={s.footerRow}>
        <Meta style={{ fontVariantNumeric: 'tabular-nums' }}>{picked.length} ta tanlandi</Meta>
        <Button onClick={next}>Davom etish</Button>
      </div>
    </>
  );
}
