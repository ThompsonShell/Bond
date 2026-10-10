'use client';

import type { ReactNode } from 'react';
import { cx } from './cx';
import s from './ui.module.css';

/** Selectable chip (44px). `strong`: filled accent when on; `soft`: accent-soft when on. */
export function ToggleChip({
  pressed,
  onToggle,
  tone = 'strong',
  muted,
  children,
}: {
  pressed: boolean;
  onToggle: () => void;
  tone?: 'strong' | 'soft';
  /** Unselected text in --text2 (profile topics). */
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onToggle} className={cx(s.toggle, tone === 'strong' ? s.toggleStrong : s.toggleSoft, muted && !pressed && s.toggleMuted)}>
      {children}
    </button>
  );
}

export function ChipGroup({ children, wide, label }: { children: ReactNode; wide?: boolean; label?: string }) {
  return (
    <div className={cx(s.chipRow, wide && s.chipRowWide)} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

/** Underlined tabs. */
export function Tabs<T extends string>({ items, value, onChange, label }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void; label: string }) {
  return (
    <div className={s.tabs} role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={t.id === value} className={s.tab} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={s.switch} onClick={() => onChange(!checked)}>
      <span className={s.switchTrack}>
        <span className={s.switchKnob} />
      </span>
    </button>
  );
}
