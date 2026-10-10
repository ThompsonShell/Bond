import type { ElementType, HTMLAttributes } from 'react';
import { cx } from './cx';
import s from './ui.module.css';

type CardProps = HTMLAttributes<HTMLElement> & { as?: ElementType };

export function Card({ as: Tag = 'section', className, ...rest }: CardProps) {
  return <Tag className={cx(s.card, className)} {...rest} />;
}
