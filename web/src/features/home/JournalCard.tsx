'use client';

import { useState } from 'react';
import { Button, Card, Chip, H2, InlineError, Input, Meta, StatusLine, StreakDots, ToggleChip } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { MOODS, type JournalState, type Mood } from '@/lib/types';
import s from './home.module.css';

/** Daily journal: pick a mood, add a note, save; then collapses to a "marked for today" state and bumps the streak. */
export function JournalCard({ initial }: { initial: JournalState }) {
  const [journal, setJournal] = useState(initial);
  const [mood, setMood] = useState<Mood | ''>(initial.today?.mood ?? '');
  const [note, setNote] = useState(initial.today?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!mood) return setError('Avval kayfiyatni tanlang');
    setBusy(true);
    try {
      setJournal(await api.saveJournal(mood, note));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Saqlab bo’lmadi');
    } finally {
      setBusy(false);
    }
  }

  async function edit() {
    setJournal(await api.editJournal());
  }

  return (
    <Card aria-label="Kundalik" className={s.journal}>
      <div className={s.row}>
        <div className={s.rowStart}>
          <Chip accent>Kundalik</Chip>
          <H2>Bugun kayfiyatingiz qanday?</H2>
        </div>
        <div className={s.streak}>
          <StreakDots week={journal.week} label="Haftalik seriya" />
          <Meta className={s.tabular}>{journal.streak} kunlik seriya</Meta>
        </div>
      </div>

      {journal.today ? (
        <div className={s.row}>
          <StatusLine>Bugun belgilandi: {journal.today.mood}</StatusLine>
          <Button variant="ghost" onClick={edit}>
            O’zgartirish
          </Button>
        </div>
      ) : (
        <div className={s.stack}>
          <div className={s.noteRow} role="group" aria-label="Kayfiyat">
            {MOODS.map((m) => (
              <ToggleChip
                key={m}
                pressed={m === mood}
                onToggle={() => {
                  setMood(m);
                  setError(null);
                }}
              >
                {m}
              </ToggleChip>
            ))}
          </div>
          <div className={s.noteRow}>
            <Input aria-label="Bugun nima o’rgandingiz?" placeholder="Bugun nima o’rgandingiz?" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            <Button onClick={save} disabled={busy}>
              Saqlash
            </Button>
          </div>
          {error && <InlineError>{error}</InlineError>}
        </div>
      )}
    </Card>
  );
}
