import type { ReactNode } from 'react';
import { Card, Logo } from '@/components/ui';
import { cx } from '@/components/ui/cx';
import ui from '@/components/ui/ui.module.css';
import s from './shell.module.css';

/** Sign-in flow frame: centred logo and a single card (400px, onboarding 520px). */
export function AuthShell({ children, footer, wide }: { children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className={s.auth}>
      <div className={s.authInner} style={{ maxWidth: wide ? 520 : 400 }}>
        <Logo href="/login" centered />
        <Card as="div" className={cx(s.authCard, wide && s.authCardRoomy)}>
          {children}
        </Card>
        {footer && <p className={cx(s.authFoot, ui.meta)}>{footer}</p>}
      </div>
    </div>
  );
}
