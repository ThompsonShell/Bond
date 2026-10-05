import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, type Notification, type Session } from '../api';
import { PinIcon, StarIcon, UserIcon, CalendarIcon } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { SessionProposal } from '../components/Sessions';
import { Avatar, Empty, ErrorBox, Loader } from '../components/ui';
import { timeAgo, useFetch } from '../lib';
import { useApp } from '../state';

export function Notifications() {
  const { refreshUnread } = useApp();
  const { data, setData, loading, error, reload } = useFetch<{ notifications: Notification[] }>('/notifications', 15_000);

  // Mark everything read once seen; the current view keeps its grouping.
  useEffect(() => {
    if (!data?.notifications.some((n) => !n.read)) return;
    const t = setTimeout(() => post('/notifications/read-all').then(refreshUnread).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [data, refreshUnread]);

  const fresh = data?.notifications.filter((n) => !n.read || n.session?.canRespond) ?? [];
  const earlier = data?.notifications.filter((n) => !fresh.includes(n)) ?? [];

  function updateSession(s: Session) {
    setData((d) => (d ? { notifications: d.notifications.map((n) => (n.session?.id === s.id ? { ...n, session: s } : n)) } : d));
  }

  return (
    <div className="page narrow">
      <PageHeader title="Bildirishnomalar" back />
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : data!.notifications.length === 0 ? (
        <Empty title="Bildirishnomalar yo'q" hint="Yangi takliflar va sheriklar shu yerda ko'rinadi." />
      ) : (
        <>
          {fresh.length > 0 && (
            <>
              <div className="group-label">Yangi</div>
              {fresh.map((n) => (
                <NotificationItem key={n.id} n={n} onSession={updateSession} highlight />
              ))}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <div className="group-label">Avvalgi</div>
              {earlier.map((n) => (
                <NotificationItem key={n.id} n={n} onSession={updateSession} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function NotificationItem({ n, onSession, highlight }: { n: Notification; onSession: (s: Session) => void; highlight?: boolean }) {
  const navigate = useNavigate();
  const open = () => {
    if (n.kind === 'streak') navigate('/home');
    else if (n.kind.startsWith('session') && n.actor) navigate(`/chat/${n.actor.id}`);
    else if (n.actor) navigate(`/u/${n.actor.id}`);
  };

  if (n.kind === 'session_invite' && n.session) {
    return (
      <div className={`card notif notif-invite ${highlight ? '' : 'dim'}`}>
        <button className="notif-head" onClick={open}>
          {n.actor && <Avatar name={n.actor.name} color={n.actor.avatarColor} size={40} radius={12} />}
          <div>
            <b>{n.title}</b>
            <small>{timeAgo(n.createdAt)} oldin</small>
          </div>
        </button>
        <SessionProposal session={n.session} onChange={onSession} compact />
      </div>
    );
  }

  const icon =
    n.kind === 'nearby' ? <PinIcon size={18} filled /> : n.kind === 'streak' ? <StarIcon size={16} /> : n.kind.startsWith('session') ? <CalendarIcon size={18} /> : <UserIcon size={18} filled />;

  return (
    <button className={`notif notif-row kind-${n.kind} ${highlight ? 'card' : ''}`} onClick={open}>
      <span className="notif-icon">{icon}</span>
      <span className="notif-text">
        <b>{n.title}</b>
        <small>
          {n.body ? `${n.body} · ` : ''}
          {timeAgo(n.createdAt)}
        </small>
      </span>
    </button>
  );
}
