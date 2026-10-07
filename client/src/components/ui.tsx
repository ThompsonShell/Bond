import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import type { AvatarColor } from '../api';
import { CloseIcon } from './Icons';

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 52) / 72} viewBox="0 0 72 52" fill="none" aria-hidden>
      <circle cx="24" cy="25" r="15" fill="#F5ECD7" />
      <circle cx="48" cy="25" r="15" fill="#F5ECD7" />
      <path d="M31.5 32 L40.5 32 L36 40 Z" fill="#F5ECD7" />
      <circle cx="24" cy="26" r="8.6" fill="#1B4332" />
      <circle cx="48" cy="26" r="8.6" fill="#1B4332" />
      <circle cx="40.2" cy="30.4" r="1.9" fill="#F5ECD7" />
    </svg>
  );
}

export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <div className="logo">
      <div className="logo-tile">
        <LogoMark />
      </div>
      <div>
        <div className="logo-name">Bondi</div>
        {tagline && <div className="logo-tag">study · connect</div>}
      </div>
    </div>
  );
}

const GRADIENTS: Record<AvatarColor, [string, string]> = {
  green: ['#95C4A8', '#2D6A4F'],
  orange: ['#E8A838', '#D4832C'],
  blue: ['#6B8AE5', '#4A6FD4'],
  amber: ['#D4832C', '#C46A1E'],
  rust: ['#C46A1E', '#A0522D'],
  rose: ['#B85878', '#8B3D5E'],
  indigo: ['#4A6FD4', '#2D4A9F'],
};

export function Avatar({
  name,
  color,
  size = 44,
  radius,
  online,
  className = '',
}: {
  name: string;
  color: AvatarColor;
  size?: number;
  radius?: number;
  online?: boolean;
  className?: string;
}) {
  const [a, b] = GRADIENTS[color] ?? GRADIENTS.green;
  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.27),
        background: `linear-gradient(135deg, ${a}, ${b})`,
        color: color === 'green' ? 'var(--avatar-fg)' : 'var(--avatar-fg-alt, #fff)',
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {name.trim().charAt(0).toUpperCase()}
      {online && <span className="avatar-dot" />}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  block?: boolean;
};

export function Button({ variant = 'primary', size = 'md', loading, block, className = '', children, disabled, ...rest }: BtnProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${block ? 'btn-block' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="spinner" /> : children}
    </button>
  );
}

export function Field({
  label,
  error,
  right,
  valid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | null; right?: ReactNode; valid?: boolean }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`input-wrap ${error ? 'has-error' : valid ? 'valid' : ''}`}>
        <input className="input" {...rest} />
        {right && <span className="input-right">{right}</span>}
      </span>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export function TextArea({ label, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <textarea className="input textarea" {...rest} />
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  if (!onClick) return <span className="chip">{children}</span>;
  return (
    <button type="button" className={`chip chip-btn ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Yopish">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {action}
    </div>
  );
}

export function Loader() {
  return (
    <div className="loader">
      <span className="spinner" />
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="error-box">
      <span>{message}</span>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Qayta urinish
        </Button>
      )}
    </div>
  );
}
