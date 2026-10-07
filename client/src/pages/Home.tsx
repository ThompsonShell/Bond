import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { del, post, type Session, type Stats } from '../api';
import { BellIcon, SearchIcon, StarIcon } from '../components/Icons';
import { Avatar, Button, Empty, ErrorBox, Loader } from '../components/ui';
import { errMsg, firstName, timeHM, useFetch } from '../lib';
import { useApp, useMe } from '../state';
import type { StudyingUser } from './types';

interface EssayToday {
  day: string;
  prompt: string;
  body: string | null;
  max: number;
}

export function Home() {
  const me = useMe();
  const { unread } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const stats = useFetch<Stats>('/stats/me');
  const now = useFetch<{ users: StudyingUser[] }>('/users/studying-now', 30_000);
  const count = now.data?.users.length ?? '…';

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h2>Xush kelibsiz, {firstName(me.name)}!</h2>
          <div className="page-sub desk-only">Bugun sizga mos {count} ta sherik onlaynda</div>
          <Link to="/matching" className="page-sub mob-only">
            Bugun {count} ta mos sherik
          </Link>
        </div>
        <div className="page-head-right desk-only">
          <form
            className="search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/matching${q ? `?q=${encodeURIComponent(q)}` : ''}`);
            }}
          >
            <SearchIcon size={16} />
            <input placeholder="Sheriklarni qidiring..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Sheriklarni qidirish" />
          </form>
          <button className="bell" onClick={() => navigate('/notifications')} aria-label="Bildirishnomalar">
            <BellIcon size={20} />
            {unread.notifications > 0 && <span className="bell-dot" />}
          </button>
        </div>
      </header>

      <div className="stats">
        <StatCard label="O'qish soatlari" value={stats.data?.hours} hint={stats.data ? `Shu haftada +${stats.data.hoursThisWeek} soat` : ''} tone="green" />
        <StatCard
          label="Sheriklar"
          value={stats.data?.partners}
          hint={stats.data ? `${stats.data.partnersThisWeek} yangi so'nggi haftada` : ''}
          tone="amber"
        />
        <StatCard label="Maqolalar" value={stats.data?.essays} hint={stats.data ? `Kunlik seriya: ${stats.data.streak} kun` : ''} tone="blue" className="desk-only" />
      </div>

      <div className="home-grid">
        <DailyEssay onSaved={(s) => stats.setData(s)} />
        <TodaySessions />
      </div>

      <h3 className="section-title">Hozir o'qiyotganlar</h3>
      {now.loading ? (
        <Loader />
      ) : now.error ? (
        <ErrorBox message={now.error} onRetry={() => now.reload()} />
      ) : now.data!.users.length === 0 ? (
        <Empty title="Hozir hech kim o'qimayapti" hint="Profilingizda “Hozir o'qiyapman” ni yoqib, birinchi bo'ling." />
      ) : (
        <div className="people-grid">
          {now.data!.users.map((u) => (
            <StudyingCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, hint, tone, className = '' }: { label: string; value?: number; hint: string; tone: 'green' | 'amber' | 'blue'; className?: string }) {
  return (
    <div className={`card stat stat-${tone} ${className}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-hint desk-only">{hint}</div>
    </div>
  );
}

function DailyEssay({ onSaved }: { onSaved: (s: Stats) => void }) {
  const { toast } = useApp();
  const essay = useFetch<EssayToday>('/essays/today');
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (essay.data?.body) setText(essay.data.body);
  }, [essay.data?.body]);

  const max = essay.data?.max ?? 500;
  const saved = !!essay.data?.body && essay.data.body === text.trim();

  async function save() {
    setBusy(true);
    try {
      const r = await post<{ body: string; stats: Stats }>('/essays', { body: text });
      essay.setData((d) => (d ? { ...d, body: r.body } : d));
      onSaved(r.stats);
      toast(`Saqlandi! Seriya: ${r.stats.streak} kun 🔥`);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`essay ${focused || text ? 'active' : ''}`}>
      <div className="essay-label desk-only">
        <StarIcon size={16} /> Kunlik maqola
      </div>
      <div className="essay-label-m mob-only">📝 Kunlik maqola</div>
      <div className="essay-prompt">{essay.data?.prompt ?? '…'}</div>
      <textarea
        className="essay-input"
        placeholder="Fikringizni yozing..."
        rows={1}
        value={text}
        maxLength={max}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setText(e.target.value)}
        aria-label="Kunlik maqola"
      />
      <div className="essay-foot">
        <span>
          {text.length} / {max} belgi
        </span>
        <Button onMouseDown={(e) => e.preventDefault()} onClick={save} loading={busy} disabled={!text.trim() || saved}>
          {saved ? 'Saqlangan ✓' : 'Saqlash'}
        </Button>
      </div>
    </section>
  );
}

function TodaySessions() {
  const me = useMe();
  const { toast } = useApp();
  const { data, setData, loading, error, reload } = useFetch<{ sessions: Session[] }>('/sessions/today', 60_000);
  const [busy, setBusy] = useState<number | null>(null);

  async function toggle(s: Session) {
    setBusy(s.id);
    try {
      const r = s.joined
        ? await del<{ session: Session }>(`/sessions/${s.id}/join`)
        : await post<{ session: Session }>(`/sessions/${s.id}/join`);
      setData((d) => (d ? { sessions: d.sessions.map((x) => (x.id === s.id ? r.session : x)) } : d));
      toast(r.session.joined ? "Seansga qo'shildingiz" : 'Seansdan chiqdingiz', r.session.joined ? 'ok' : 'info');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card desk-only">
      <h3>Bugungi seans</h3>
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : data!.sessions.length === 0 ? (
        <Empty title="Bugun seans yo'q" hint="Chatda sherigingizga seans taklif qiling." />
      ) : (
        data!.sessions.map((s) => (
          <div key={s.id} className="session-item">
            <div className="session-box">
              <b>{s.title}</b>
              <small>
                {s.place} · {timeHM(s.startsAt)}
              </small>
              <div className="stack">
                {s.participants.slice(0, 5).map((p) => (
                  <Avatar key={p.id} name={p.name} color={p.avatarColor} size={24} radius={12} />
                ))}
              </div>
            </div>
            {s.creator?.id !== me.id && (
              <Button block loading={busy === s.id} variant={s.joined ? 'secondary' : 'primary'} onClick={() => toggle(s)}>
                {s.joined ? "Qo'shildingiz ✓" : "Qo'shilish"}
              </Button>
            )}
          </div>
        ))
      )}
    </section>
  );
}

function StudyingCard({ user }: { user: StudyingUser }) {
  const navigate = useNavigate();
  const online = user.placeType === 'online';
  return (
    <div className="card person">
      <div className="person-row">
        <Avatar name={user.name} color={user.avatarColor} size={44} radius={12} />
        <button className="person-text" onClick={() => navigate(`/u/${user.id}`)}>
          <b>{user.name}</b>
          <small>
            {user.place || 'Online'} · {user.subject}
          </small>
        </button>
        <span className="live-dot" title="Hozir o'qiyapti" />
      </div>
      <div className="btn-row">
        <Button onClick={() => navigate(`/chat/${user.id}?join=1`)}>{online ? 'Online' : "Qo'shilish"}</Button>
        <Button variant="secondary" className="desk-only" onClick={() => navigate(`/chat/${user.id}`)}>
          Chat
        </Button>
      </div>
    </div>
  );
}
