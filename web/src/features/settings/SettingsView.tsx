'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, Field, H2, InlineError, Meta, StatusLine, Switch } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { applyMode, type ThemeMode } from '@/lib/theme';
import type { CurrentUser, NotificationSettings } from '@/lib/types';
import s from './settings.module.css';

const SWITCHES: { id: keyof NotificationSettings; label: string; hint: string }[] = [
  { id: 'match', label: 'Yangi mos sherik', hint: 'Sizga mos odam topilganda' },
  { id: 'chat', label: 'Xabarlar', hint: 'Yangi xabar kelganda' },
  { id: 'event', label: 'Tadbir eslatmasi', hint: 'Tadbirdan bir kun oldin' },
];

export function SettingsView({
  user,
  initialSettings,
  initialMode,
}: {
  user: Pick<CurrentUser, 'name' | 'email'>;
  initialSettings: NotificationSettings;
  initialMode: ThemeMode;
}) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [settings, setSettings] = useState(initialSettings);

  async function save() {
    if (!name.trim() || !email.trim()) {
      setSaved(false);
      return setError('Ism va email bo’sh bo’lmasligi kerak');
    }
    try {
      await api.updateMe({ name, email });
      setError(null);
      setSaved(true);
      router.refresh(); // sidebar shows the new name
    } catch (e) {
      setSaved(false);
      setError(e instanceof ApiError ? e.message : 'Saqlab bo’lmadi');
    }
  }

  function pickMode(m: ThemeMode) {
    setMode(m);
    applyMode(m);
  }

  async function toggle(id: keyof NotificationSettings, value: boolean) {
    setSettings((st) => ({ ...st, [id]: value }));
    setSettings(await api.updateSettings({ [id]: value }));
  }

  async function logout() {
    await api.logout();
    router.push('/login');
  }

  return (
    <>
      <Card className={s.account}>
        <H2>Hisob</H2>
        <div className={s.fields}>
          <Field
            label="Ism"
            id="sz-ism"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
              setError(null);
            }}
          />
          <Field
            label="Email"
            id="sz-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
              setError(null);
            }}
          />
        </div>
        {error && <InlineError>{error}</InlineError>}
        <div className={s.saveRow}>
          <Button onClick={save}>Saqlash</Button>
          {saved && <StatusLine className={s.small}>Saqlandi</StatusLine>}
        </div>
      </Card>

      <Card className={s.row}>
        <div>
          <H2>Ko’rinish</H2>
          <Meta>Mavzu shu sahifada darhol almashadi.</Meta>
        </div>
        <div role="group" aria-label="Mavzu" className={s.segment}>
          {(
            [
              { id: 'tungi', label: 'Tungi' },
              { id: 'yorug', label: 'Yorug’' },
            ] as const
          ).map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => pickMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className={s.switches}>
        <div className={s.switchHead}>
          <H2>Bildirishnomalar</H2>
        </div>
        {SWITCHES.map((sw) => (
          <div key={sw.id} className={s.switchRow}>
            <div style={{ minWidth: 0 }}>
              <div className={s.switchLabel}>{sw.label}</div>
              <Meta>{sw.hint}</Meta>
            </div>
            <Switch label={sw.label} checked={settings[sw.id]} onChange={(v) => toggle(sw.id, v)} />
          </div>
        ))}
      </Card>

      <Card className={s.row}>
        <div>
          <H2>Hisobdan chiqish</H2>
          <Meta>Qayta kirish uchun email va parol kerak bo’ladi.</Meta>
        </div>
        <Button variant="secondary" onClick={logout}>
          Chiqish
        </Button>
      </Card>
    </>
  );
}
