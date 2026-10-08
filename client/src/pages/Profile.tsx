import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, del, get, post, type Me, type PlaceType, type ProfileUser, type Schedule, type Stats } from '../api';
import { MoreIcon, PlayIcon, StarIcon, UploadIcon } from '../components/Icons';
import { Avatar, Button, Chip, ErrorBox, Field, Loader, Modal, TextArea, Toggle } from '../components/ui';
import { dayAgo, duration, errMsg, firstName, PLACE_LABELS, SCHEDULE_LABELS, useFetch } from '../lib';
import { useApp, useMe } from '../state';

interface ProfileResponse {
  user: ProfileUser & { distanceKm: number | null; connected: boolean };
  stats: Stats;
  match: { score: number; reasons: string[] } | null;
}

export function MyProfile() {
  const me = useMe();
  return <ProfileView userId={me.id} self />;
}

export function UserProfile() {
  const { id } = useParams();
  const me = useMe();
  const userId = Number(id);
  return <ProfileView key={userId} userId={userId} self={userId === me.id} />;
}

function ProfileView({ userId, self }: { userId: number; self: boolean }) {
  const me = useMe();
  const navigate = useNavigate();
  const { toast } = useApp();
  const { data, setData, loading, error, reload } = useFetch<ProfileResponse>(`/users/${userId}`);
  const [editing, setEditing] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Keep the self view in sync with edits made through the auth context.
  useEffect(() => {
    if (self && data) setData((d) => (d ? { ...d, user: { ...d.user, ...me } } : d));
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loader />;
  if (error || !data) return <div className="page"><ErrorBox message={error || 'Topilmadi'} onRetry={() => reload()} /></div>;
  const { user, stats, match } = data;

  async function connect() {
    setConnecting(true);
    try {
      await post(`/users/${user.id}/connect`);
      setData((d) => (d ? { ...d, user: { ...d.user, connected: true }, stats: { ...d.stats, partners: d.stats.partners + 1 } } : d));
      toast(`${firstName(user.name)} bilan bog'landingiz!`);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="page profile">
      <div className="profile-mobile-head">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Orqaga">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <b>Profil</b>
        {self ? (
          <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Sozlamalar">
            <MoreIcon size={18} />
          </button>
        ) : (
          <span style={{ width: 36 }} />
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <section className="card profile-card">
            <Avatar name={user.name} color={user.avatarColor} size={128} radius={30} className="avatar-xl" online={user.online && !self} />
            <h2>{user.name}</h2>
            <div className="muted small">
              @{user.username} · {user.city}
              {user.distanceKm != null && !self ? ` · ${user.distanceKm} km` : ''}
            </div>
            <div className="profile-stats">
              <div>
                <b>{stats.partners}</b>
                <small>Sheriklar</small>
              </div>
              <div>
                <b>{stats.hours}</b>
                <small>Soat</small>
              </div>
              <div>
                <b>{stats.essays}</b>
                <small>Maqolalar</small>
              </div>
            </div>
            {self ? (
              <Button block onClick={() => setEditing(true)}>
                Profilni tahrirlash
              </Button>
            ) : (
              <div className="btn-row">
                {user.connected ? (
                  <Button onClick={() => navigate(`/chat/${user.id}`)}>Xabar yozish</Button>
                ) : (
                  <Button loading={connecting} onClick={connect}>
                    Bog'lanish
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigate(`/chat/${user.id}`)}>
                  Chat
                </Button>
              </div>
            )}
            {match && (
              <div className="match-pill">
                <b>{match.score}%</b> moslik{match.reasons.length ? ` · ${match.reasons.join(', ')}` : ''}
              </div>
            )}
          </section>

          <section className="card">
            <h3>Qiziqishlar</h3>
            <div className="chips">
              {user.interests.length ? user.interests.map((t) => <Chip key={t}>{t}</Chip>) : <span className="faint">Hali qo'shilmagan</span>}
            </div>
          </section>

          <section className="card">
            <h3>O'qish uslubi</h3>
            <div className="kv">
              <span>Hozir</span>
              <b>{user.subject || '—'}</b>
            </div>
            <div className="kv">
              <span>Joy</span>
              <b>
                {user.place || '—'} {user.placeType ? `(${PLACE_LABELS[user.placeType]})` : ''}
              </b>
            </div>
            <div className="kv">
              <span>Vaqt</span>
              <b>{SCHEDULE_LABELS[user.schedule]}</b>
            </div>
          </section>
        </div>

        <div className="profile-right">
          <section className="card">
            <h3>About Me</h3>
            <p className="about">{user.bio || (self ? "O'zingiz haqingizda yozing — “Profilni tahrirlash” tugmasini bosing." : "Hali yozilmagan.")}</p>
          </section>

          <VideoCard url={user.videoUrl} self={self} />

          <section className="card">
            <h3>Yaqinda o'qigan</h3>
            {stats.recent.length === 0 ? (
              <p className="faint">Hali o'quv seanslari yo'q.</p>
            ) : (
              <ul className="recent">
                {stats.recent.map((r, i) => (
                  <li key={i}>
                    <span className="recent-icon">
                      <StarIcon size={14} />
                    </span>
                    <div>
                      <b>{r.title}</b>
                      <small>
                        {r.place} · {duration(r.minutes)}
                        {r.partnerName ? ` · ${r.partnerName} bilan` : ''}
                      </small>
                    </div>
                    <span className="faint small">{dayAgo(r.day)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {editing && <EditProfile onClose={() => setEditing(false)} />}
    </div>
  );
}

function VideoCard({ url, self }: { url: string | null; self: boolean }) {
  const { setUser, toast } = useApp();
  const input = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > 50 * 1024 * 1024) return toast('Fayl juda katta (maks. 50 MB)', 'error');
    const fd = new FormData();
    fd.append('video', file);
    setBusy(true);
    try {
      const r = await api<{ user: Me }>('POST', '/users/me/video', fd);
      setUser(r.user);
      toast('Video yuklandi');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const r = await del<{ user: Me }>('/users/me/video');
      setUser(r.user);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  }

  if (!url && !self) return null;

  return (
    <section className="card">
      <h3>Video taqdimot</h3>
      <div className="video">
        {url ? (
          <>
            <video
              ref={video}
              src={url}
              controls={playing}
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onEnded={() => setPlaying(false)}
            />
            {!playing && (
              <button className="play" onClick={() => video.current?.play()} aria-label="Ijro etish">
                <PlayIcon size={22} />
              </button>
            )}
          </>
        ) : (
          <button className="video-upload" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <span className="spinner" /> : <UploadIcon size={28} />}
            <span>Video yuklash (maks. 50 MB)</span>
          </button>
        )}
      </div>
      <div className="video-foot">
        <span className="faint small">O'zim haqimda qisqacha — o'quv uslubi va maqsadlarim.</span>
        {self && url && (
          <span className="btn-row-inline">
            <button className="link-btn" onClick={() => input.current?.click()} disabled={busy}>
              Almashtirish
            </button>
            <button className="link-btn danger" onClick={remove} disabled={busy}>
              O'chirish
            </button>
          </span>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
    </section>
  );
}

function EditProfile({ onClose }: { onClose: () => void }) {
  const me = useMe();
  const { updateMe, toast } = useApp();
  const [f, setF] = useState({
    name: me.name,
    username: me.username,
    city: me.city,
    bio: me.bio,
    subject: me.subject,
    place: me.place,
    placeType: me.placeType,
    schedule: me.schedule,
    isStudying: me.isStudying,
    interests: me.interests,
  });
  const [options, setOptions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    get<{ options: string[] }>('/users/interests').then((r) => setOptions([...new Set([...r.options, ...me.interests])])).catch(() => {});
  }, [me.interests]);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateMe(f);
      toast('Profil saqlandi');
      onClose();
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Profilni tahrirlash" onClose={onClose}>
      <form className="form" onSubmit={save}>
        <div className="form-row">
          <Field label="To'liq ism" value={f.name} onChange={(e) => set('name', e.target.value)} required />
          <Field label="Foydalanuvchi nomi" value={f.username} onChange={(e) => set('username', e.target.value)} required />
        </div>
        <TextArea label="Bio" rows={4} maxLength={600} value={f.bio} onChange={(e) => set('bio', e.target.value)} />
        <div className="form-row">
          <Field label="Shahar" value={f.city} onChange={(e) => set('city', e.target.value)} />
          <Field label="Hozir nima o'qiyapsiz" placeholder="IELTS Writing" value={f.subject} onChange={(e) => set('subject', e.target.value)} />
        </div>
        <div className="form-row">
          <Field label="Joy" placeholder="Registon Co-work" value={f.place} onChange={(e) => set('place', e.target.value)} />
          <label className="field">
            <span className="field-label">Joy turi</span>
            <span className="input-wrap">
              <select className="input" value={f.placeType} onChange={(e) => set('placeType', e.target.value as PlaceType)}>
                {Object.entries(PLACE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <div className="field">
          <span className="field-label">Qulay vaqt</span>
          <div className="chips">
            {Object.entries(SCHEDULE_LABELS).map(([k, v]) => (
              <Chip key={k} active={f.schedule === k} onClick={() => set('schedule', k as Schedule)}>
                {v}
              </Chip>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-label">Qiziqishlar</span>
          <div className="chips">
            {options.map((t) => (
              <Chip
                key={t}
                active={f.interests.includes(t)}
                onClick={() => set('interests', f.interests.includes(t) ? f.interests.filter((x) => x !== t) : [...f.interests, t])}
              >
                {t}
              </Chip>
            ))}
          </div>
        </div>
        <div className="setting-row plain">
          <span>Hozir o'qiyapman (boshqalarga ko'rinadi)</span>
          <Toggle label="Hozir o'qiyapman" checked={f.isStudying} onChange={(v) => set('isStudying', v)} />
        </div>
        <Button type="submit" block size="lg" loading={busy}>
          Saqlash
        </Button>
      </form>
    </Modal>
  );
}
