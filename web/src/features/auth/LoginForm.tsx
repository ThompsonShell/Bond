'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Field, H1, InlineError, Meta, TextLink } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { SocialButtons } from './SocialButtons';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api.login(String(form.get('email')), String(form.get('password')));
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kirib bo’lmadi');
      setBusy(false);
    }
  }

  return (
    <>
      <div>
        <H1>Xush kelibsiz</H1>
        <Meta style={{ fontSize: 14 }}>Hisobingizga kiring</Meta>
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email" id="login-email" name="email" type="email" autoComplete="email" placeholder="aziza@student.uz" required />
        <Field
          label="Parol"
          id="login-parol"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          labelAside={
            <TextLink href="/reset-password" style={{ fontSize: 14, padding: '12px 0', margin: '-12px 0' }}>
              Unutdingizmi?
            </TextLink>
          }
        />
        {error && <InlineError>{error}</InlineError>}
        <Button type="submit" disabled={busy}>
          Kirish
        </Button>
      </form>
      <SocialButtons />
    </>
  );
}
