import type { ReactNode } from 'react';
import { CountsProvider } from '@/components/shell/CountsProvider';
import { Sidebar } from '@/components/shell/Sidebar';
import s from '@/components/shell/shell.module.css';
import { getCounts, getUser } from '@/lib/server/store';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: ReactNode }) {
  const user = getUser();
  return (
    <CountsProvider initial={getCounts()}>
      <div className={s.wrap}>
        <Sidebar user={{ name: user.name, initials: user.initials }} />
        {children}
      </div>
    </CountsProvider>
  );
}
