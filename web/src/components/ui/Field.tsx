import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../icons';
import { cx } from './cx';
import s from './ui.module.css';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { onPage?: boolean }>(function Input(
  { onPage, className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx(s.input, onPage && s.onPage, className)} {...rest} />;
});

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  /** Extra element on the label row (e.g. the "Forgot password?" link). */
  labelAside?: ReactNode;
  className?: string;
}

/** Labelled input with optional hint and inline error (always uses a real <label>). */
export function Field({ label, hint, error, labelAside, className, id, ...rest }: FieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-err` : undefined;
  return (
    <div className={cx(s.field, className)}>
      {labelAside ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <label className={s.label} htmlFor={inputId}>
            {label}
          </label>
          {labelAside}
        </div>
      ) : (
        <label className={s.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <Input id={inputId} aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined} aria-invalid={!!error || undefined} {...rest} />
      {hint && (
        <div className={s.meta} id={hintId}>
          {hint}
        </div>
      )}
      {error && <InlineError id={errId}>{error}</InlineError>}
    </div>
  );
}

export function InlineError({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className={s.error} role="alert" id={id}>
      {children}
    </div>
  );
}

export function StatusLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx(s.status, className)} role="status">
      <Icon name="check" />
      <span>{children}</span>
    </span>
  );
}

/** Search input with a leading icon (the design's `label.inp`). */
export function SearchBox({ label, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cx(s.searchBox, className)}>
      <Icon name="search" />
      <input type="search" aria-label={label} placeholder={label} {...rest} />
    </label>
  );
}
