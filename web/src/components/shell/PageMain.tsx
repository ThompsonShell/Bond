import type { ReactNode } from 'react';
import s from './shell.module.css';

/**
 * Main column of an app page. `narrow` caps the content at 760px while the
 * column itself still takes the remaining width (so the menu stays ~216px).
 */
export function PageMain({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  if (!narrow) return <main className={s.main}>{children}</main>;
  return (
    <div className={s.mainSlot}>
      <main className={`${s.main} ${s.narrow}`}>{children}</main>
    </div>
  );
}
