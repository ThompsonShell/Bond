import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentProps } from 'react';
import { cx } from './cx';
import s from './ui.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variantClass: Record<ButtonVariant, string> = { primary: s.btn, secondary: s.btn2, ghost: s.ghost };

interface Common {
  variant?: ButtonVariant;
  /** Square 44×44 icon button; requires `aria-label`. */
  iconOnly?: boolean;
}

export function Button({ variant = 'primary', iconOnly, className, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(variantClass[variant], iconOnly && s.iconOnly, className)} {...rest} />;
}

export function ButtonLink({
  variant = 'primary',
  iconOnly,
  className,
  ...rest
}: Common & ComponentProps<typeof Link> & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <Link className={cx(variantClass[variant], iconOnly && s.iconOnly, className)} {...rest} />;
}

export function TextLink({ className, ...rest }: ComponentProps<typeof Link>) {
  return <Link className={cx(s.link, className)} {...rest} />;
}
