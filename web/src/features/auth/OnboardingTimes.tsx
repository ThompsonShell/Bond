'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar, Button, ButtonLink, ChipGroup, H1, H2, MatchPercent, Meta, ToggleChip } from '@/components/ui';
import { api } from '@/lib/api';
import { STUDY_TIMES, type Person, type StudyTime } from '@/lib/types';
import { Steps } from './Steps';
import s from './auth.module.css';

export function OnboardingTimes({ initialTimes, suggestion }: { initialTimes: StudyTime[]; suggestion: Person | null }) {
  const router = useRouter();
  const [picked, setPicked] = useState<StudyTime[]>(initialTimes);
  const [busy, setBusy] = useState(false);

  const toggle = (t: StudyTime) => setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  async function start() {
    setBusy(true);
    await api.updateMe({ studyTimes: picked });
    router.push('/');
  }

  return (
    <>
      <Steps current={2} total={2} />
      <div>
        <H1>Qachon dars qilasiz?</H1>
        <Meta style={{ fontSize: 14 }}>Bo’sh vaqtingizga mos sheriklarni birinchi ko’rsatamiz.</Meta>
      </div>
      <ChipGroup wide label="Dars vaqti">
        {STUDY_TIMES.map((t) => (
          <ToggleChip key={t} pressed={picked.includes(t)} onToggle={() => toggle(t)}>
            {t}
          </ToggleChip>
        ))}
      </ChipGroup>
      {suggestion && (
        <div className={s.matchBox}>
          <H2 small>Sizga mos sherik topildi</H2>
          <div className={s.matchRow}>
            <Avatar initials={suggestion.initials} size={40} />
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{suggestion.name}</div>
              <Meta>{suggestion.matchNote}</Meta>
            </div>
            <MatchPercent value={suggestion.matchPercent} />
          </div>
        </div>
      )}
      <div className={s.footerRow}>
        <ButtonLink href="/onboarding/1" variant="secondary">
          Orqaga
        </ButtonLink>
        <Button onClick={start} disabled={busy}>
          Boshlash
        </Button>
      </div>
    </>
  );
}
