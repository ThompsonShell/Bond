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
    <div className="page narrow notif-page">
      <PageHeader title="Bildirishnomalar" back />
      <div className="title-m mob-only">Bildirishnomalar</div>
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
              <div className="notif-group">
                {fresh.map((n) => (
                  <NotificationItem key={n.id} n={n} onSession={updateSession} highlight />
                ))}
              </div>
            </>
          )}
          {earlier.length > 0 && (
            <>
              <div className="group-label">Avvalgi</div>
              <div className="notif-group">
                {earlier.map((n) => (
                  <NotificationItem key={n.id} n={n} onSession={updateSession} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Bold the actor's first name inside the title, as in the design ("<b>Sardor</b> sizga taklif yubordi"). */
function Title({ n }: { n: Notification }) {
  const name = n.actor?.name.split(' ')[0];
  const i = name ? n.title.indexOf(name) : -1;
  if (!name || i < 0) return <span className="notif-title">{n.title}</span>;
  return (
    <span className="notif-title">
      {n.title.slice(0, i)}
      <b>{name}</b>
      {n.title.slice(i + name.length)}
    </span>
  );
}

function NotificationItem({ n, onSession, highlight }: { n: Notification; onSession: (s: Session) => void; highlight?: boolean }) {
  const navigate = useNavigate();
  const open = () => {
    if (n.kind === 'streak') navigate('/home');
    else if (n.kind.startsWith('session') && n.actor) navigate(`/chat/${n.actor.id}`);
    else if (n.kind === 'nearby') navigate('/map');
    else if (n.actor) navigate(`/u/${n.actor.id}`);
  };

  if (n.kind === 'session_invite' && n.session) {
    return (
      <div className="notif-invite">
        <button className="notif-head" onClick={open}>
          {n.actor && <Avatar name={n.actor.name} color={n.actor.avatarColor} size={40} radius={12} />}
          <div>
            <Title n={n} />
            <span className="notif-time">{timeAgo(n.createdAt)} oldin</span>
          </div>
        </button>
        <SessionProposal session={n.session} onChange={onSession} compact />
      </div>
    );
  }

  if (n.kind === 'nearby' && highlight) {
    return (
      <button className="notif-nearby" onClick={open}>
        <span className="notif-icon">
          <PinIcon size={18} filled />
        </span>
        <span className="notif-text">
          <Title n={n} />
          <span className="notif-sub">{n.body}</span>
        </span>
      </button>
    );
  }

  const amber = n.kind === 'streak' || n.kind === 'nearby';
  const icon =
    n.kind === 'nearby' ? <PinIcon size={16} filled /> : n.kind === 'streak' ? <StarIcon size={16} /> : n.kind.startsWith('session') ? <CalendarIcon size={16} /> : <UserIcon size={16} filled />;

  return (
    <button className="notif-row" onClick={open}>
      <span className={`notif-icon ${amber ? 'amber' : ''}`}>{icon}</span>
      <span className="notif-text">
        <Title n={n} />
        <span className="notif-time">{timeAgo(n.createdAt)}</span>
      </span>
    </button>
  );
}
