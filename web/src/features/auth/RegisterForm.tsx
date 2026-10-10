'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Field, H1, InlineError, Meta } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { SocialButtons } from './SocialButtons';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.register(String(form.get('name')), String(form.get('email')), String(form.get('password')));
      router.push('/onboarding/1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ro’yxatdan o’tib bo’lmadi');
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <H1>Hisob yarating</H1>
        <Meta style={{ fontSize: 14 }}>Bir daqiqada tayyor bo’ladi</Meta>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Ism" id="rx-ism" name="name" type="text" autoComplete="given-name" placeholder="Aziza" required />
        <Field label="Email" id="rx-email" name="email" type="email" autoComplete="email" placeholder="aziza@student.uz" required />
        <Field label="Parol" id="rx-parol" name="password" type="password" autoComplete="new-password" hint="Kamida 8 ta belgi" minLength={8} required />
        {error && <InlineError>{error}</InlineError>}
        <Button type="submit" disabled={busy}>
          Ro’yxatdan o’tish
        </Button>
      </form>
      <SocialButtons />
    </>
  );
}
