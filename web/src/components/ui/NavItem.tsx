'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons';
import { Badge } from './Bits';
import { cx } from './cx';
import s from './ui.module.css';

export function NavItem({ href, icon, children, badge, badgeLabel }: { href: string; icon?: IconName; children: ReactNode; badge?: number; badgeLabel?: string }) {
  const path = usePathname();
  const active = href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} className={cx(s.nav, active && s.navActive)} aria-current={active ? 'page' : undefined}>
      {icon && <Icon name={icon} />}
      {children}
      {badge !== undefined && <Badge count={badge} label={badgeLabel} />}
    </Link>
  );
}
