import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import s from './ui.module.css';

export function H1({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cx(s.h1, className)} {...rest} />;
}

export function H2({ small, className, ...rest }: HTMLAttributes<HTMLHeadingElement> & { small?: boolean }) {
  return <h2 className={cx(s.h2, small && s.h2Small, className)} {...rest} />;
}

export function Meta({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(s.meta, className)} {...rest} />;
}

export function Divider({ children }: { children: ReactNode }) {
  return <div className={cx(s.divider, s.meta)}>{children}</div>;
}
