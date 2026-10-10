'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCounts } from '@/components/shell/CountsProvider';
import { Icon } from '@/components/icons';
import { ButtonLink, H1, Meta, SearchBox } from '@/components/ui';
import s from './home.module.css';

export function HomeHeader({ name, today }: { name: string; today: string }) {
  const router = useRouter();
  const { unreadNotifications } = useCounts();
  const [q, setQ] = useState('');
  return (
    <header className={s.header}>
      <div>
        <H1>Salom, {name}</H1>
        <Meta>{today}</Meta>
      </div>
      <div className={s.headerTools}>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/discover?q=${encodeURIComponent(q.trim())}` : '/discover');
          }}
        >
          <SearchBox label="Qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <ButtonLink
          href="/notifications"
          variant="secondary"
          iconOnly
          className={s.bell}
          aria-label={unreadNotifications ? `Bildirishnomalar, ${unreadNotifications} ta yangi` : 'Bildirishnomalar'}
        >
          <Icon name="bell" />
          {unreadNotifications > 0 && <span className={s.bellDot} />}
        </ButtonLink>
      </div>
    </header>
  );
}
