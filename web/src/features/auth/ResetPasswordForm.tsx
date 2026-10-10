'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, Field, H1, Meta } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import s from './auth.module.css';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim();
    if (v.indexOf('@') < 1 || v.indexOf('.') < 0) return setError('Email manzilini to’liq kiriting');
    try {
      const r = await api.resetPassword(v);
      setSentTo(r.email);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Yuborib bo’lmadi');
    }
  }

  return (
    <>
      <div>
        <H1>Parolni tiklash</H1>
        <Meta style={{ fontSize: 14 }}>Emailingizni kiriting, tiklash havolasini yuboramiz.</Meta>
      </div>
      {sentTo ? (
        <div role="status" className={s.sent}>
          <div className={s.sentBox}>
            <Icon name="check" style={{ marginTop: 2 }} />
            <span>Havola yuborildi: {sentTo}. Pochtangizni tekshiring.</span>
          </div>
          <Button variant="ghost" style={{ justifyContent: 'center' }} onClick={() => setSentTo(null)}>
            Boshqa email kiritish
          </Button>
        </div>
      ) : (
        <form onSubmit={send} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field
            label="Email"
            id="pr-email"
            type="email"
            autoComplete="email"
            placeholder="aziza@student.uz"
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
          <Button type="submit">Havola yuborish</Button>
        </form>
      )}
    </>
  );
}
