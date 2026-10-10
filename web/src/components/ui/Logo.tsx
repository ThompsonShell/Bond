import Link from 'next/link';
import { cx } from './cx';
import s from './ui.module.css';

export function Logo({ href = '/', centered }: { href?: string; centered?: boolean }) {
  return (
    <Link href={href} className={cx(s.logo, centered && s.logoCentered)} aria-label="bondi, bosh sahifa">
      <span className={s.logoMark} aria-hidden="true">
        b
      </span>
      <span>bondi</span>
    </Link>
  );
}
