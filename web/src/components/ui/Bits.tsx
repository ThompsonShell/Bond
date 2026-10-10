import type { ReactNode } from 'react';
import { cx } from './cx';
import s from './ui.module.css';

export type AvatarSize = 32 | 36 | 40 | 44 | 72;

const FONT: Record<AvatarSize, number> = { 32: 12, 36: 12, 40: 13, 44: 14, 72: 24 };

/** Round initials avatar. `self` = the current user (quiet colours). */
export function Avatar({ initials, size = 40, self }: { initials: string; size?: AvatarSize; self?: boolean }) {
  return (
    <span className={cx(s.avatar, self && s.avatarSelf)} style={{ width: size, height: size, fontSize: FONT[size] }} aria-hidden="true">
      {initials}
    </span>
  );
}

/** Unread counter; renders nothing for zero. */
export function Badge({ count, label }: { count: number; label?: string }) {
  if (!count) return null;
  return (
    <span className={s.badge} aria-label={label ?? `${count} ta yangi`}>
      {count}
    </span>
  );
}

export function Chip({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <span className={cx(s.chip, accent && s.chipAccent)}>{children}</span>;
}

export function MatchPercent({ value }: { value: number }) {
  return (
    <span className={s.pct} aria-label={`${value}% mos`}>
      {value}%
    </span>
  );
}

export function DateTile({ month, day, size = 'small', tone = 'neutral' }: { month: string; day: string; size?: 'small' | 'large'; tone?: 'neutral' | 'accent' | 'pos' }) {
  return (
    <div className={cx(s.dateTile, size === 'large' && s.dateTileLarge, tone === 'accent' && s.dateTileAccent, tone === 'pos' && s.dateTilePos)} aria-hidden="true">
      <span className={s.month}>{month}</span>
      <span className={s.day}>{day}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className={cx(s.card, s.empty)}>
      <div>
        <h2 className={s.h2}>{title}</h2>
        <div className={s.meta}>{text}</div>
      </div>
      {action}
    </div>
  );
}

/** Week streak bar (7 segments). */
export function StreakDots({ week, large, label }: { week: boolean[]; large?: boolean; label: string }) {
  return (
    <div className={s.dots} role="img" aria-label={label}>
      {week.map((on, i) => (
        <span key={i} className={cx(s.dot, large && s.dotLarge, on && s.dotOn)} />
      ))}
    </div>
  );
}
