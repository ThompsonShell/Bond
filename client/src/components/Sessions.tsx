import { useState } from 'react';
import { post, type Session } from '../api';
import { duration, errMsg, sessionWhen } from '../lib';
import { useApp } from '../state';
import { Button, Field, Modal } from './ui';

/** "O'quv seans taklifi" card shown in chat and notifications. */
export function SessionProposal({ session, onChange, compact }: { session: Session; onChange: (s: Session) => void; compact?: boolean }) {
  const { toast, refreshUnread } = useApp();
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null);

  async function respond(accept: boolean) {
    setBusy(accept ? 'accept' : 'decline');
    try {
      const r = await post<{ session: Session }>(`/sessions/${session.id}/respond`, { accept });
      onChange(r.session);
      refreshUnread();
      toast(accept ? 'Seans qabul qilindi' : 'Taklif rad etildi', accept ? 'ok' : 'info');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  const statusText =
    session.status === 'accepted' ? 'Qabul qilindi ✓' : session.status === 'declined' ? 'Rad etildi' : session.canRespond ? null : 'Javob kutilmoqda…';

  const actions = statusText ? (
    <div className={`proposal-status status-${session.status}`}>{statusText}</div>
  ) : (
    <div className="proposal-actions">
      <Button size="sm" loading={busy === 'accept'} disabled={!!busy} onClick={() => respond(true)}>
        {compact ? 'Qabul' : 'Qabul qilish'}
      </Button>
      <Button size="sm" variant="secondary" loading={busy === 'decline'} disabled={!!busy} onClick={() => respond(false)}>
        {compact ? 'Rad' : 'Rad etish'}
      </Button>
    </div>
  );

  // Notification card (bondi-app.html · Bildirishnomalar)
  if (compact) {
    return (
      <div className="proposal proposal-compact">
        <div className="proposal-box">
          <div className="proposal-title">
            {session.title} · {session.place}
          </div>
          <div className="proposal-meta">
            {sessionWhen(session.startsAt)} · {duration(session.durationMin)}
          </div>
        </div>
        {actions}
      </div>
    );
  }

  // Chat card (bondi-web.html · Xabarlar)
  return (
    <div className="proposal">
      <div className="proposal-label">
        <span className="dot" /> O'quv seans taklifi
      </div>
      <div className="proposal-title">{session.title}</div>
      <div className="proposal-meta">
        {session.place} · {sessionWhen(session.startsAt)} · {duration(session.durationMin)}
      </div>
      {actions}
    </div>
  );
}

function localInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProposeSessionModal({
  partnerId,
  defaultPlace,
  onClose,
  onCreated,
}: {
  partnerId: number;
  defaultPlace?: string;
  onClose: () => void;
  onCreated: (s: Session) => void;
}) {
  const { toast } = useApp();
  const start = new Date(Date.now() + 60 * 60_000);
  start.setMinutes(0, 0, 0);
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState(defaultPlace || '');
  const [when, setWhen] = useState(localInputValue(start));
  const [mins, setMins] = useState(120);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await post<{ session: Session }>('/sessions', {
        partnerId,
        title,
        place,
        startsAt: new Date(when).toISOString(),
        durationMin: mins,
      });
      onCreated(r.session);
      toast('Taklif yuborildi');
      onClose();
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="O'quv seans taklifi" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <Field label="Mavzu" placeholder="IELTS Writing — Task 2" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        <Field label="Joy" placeholder="Registon Co-work" value={place} onChange={(e) => setPlace(e.target.value)} required />
        <div className="form-row">
          <Field label="Vaqt" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
          <label className="field">
            <span className="field-label">Davomiylik</span>
            <span className="input-wrap">
              <select className="input" value={mins} onChange={(e) => setMins(Number(e.target.value))}>
                {[30, 60, 90, 120, 180, 240].map((m) => (
                  <option key={m} value={m}>
                    {duration(m)}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <Button type="submit" block size="lg" loading={busy}>
          Taklif yuborish
        </Button>
      </form>
    </Modal>
  );
}
