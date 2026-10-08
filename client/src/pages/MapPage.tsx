import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NearbyUser } from '../api';
import { LocateIcon, SearchIcon } from '../components/Icons';
import { Avatar, Button, Empty, ErrorBox, Tag } from '../components/ui';
import { errMsg, useFetch } from '../lib';
import { useApp, useMe } from '../state';

const FILTERS = [
  { key: 'all', label: 'Hammasi' },
  { key: 'cowork', label: 'Co-work' },
  { key: 'library', label: 'Kutubxona' },
  { key: 'cafe', label: 'Kafe' },
];

// Vertical centre/radius (in %) leave room for the search bar at the top.
const MAP_CY = 58;
const MAP_RY = 32;

const PIN_COLORS: Record<string, string> = { orange: 'pin-amber', amber: 'pin-amber', rust: 'pin-amber' };

export function MapPage() {
  const me = useMe();
  const { updateMe, toast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const path = `/users/nearby?filter=${filter}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  const { data, error, reload } = useFetch<{ users: NearbyUser[] }>(me.lat != null ? path : null, 30_000);
  const users = data?.users ?? [];

  // Scale so the farthest person sits near the edge of the map.
  const scale = useMemo(() => Math.max(3, ...users.map((u) => Math.max(Math.abs(u.dx), Math.abs(u.dy)))) * 1.15, [users]);

  function locate() {
    if (!navigator.geolocation) return toast("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi", 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast('Joylashuv yangilandi');
          reload();
        } catch (e) {
          toast(errMsg(e), 'error');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast('Joylashuvga ruxsat berilmadi', 'error');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="map-page">
      <div className="map">
        <div className="map-grid" />
        <form className="map-search" onSubmit={(e) => e.preventDefault()}>
          <SearchIcon size={16} />
          <input placeholder="Hudud qidiring..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Hudud qidirish" />
          <div className="map-filters">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </form>

        {me.lat == null ? (
          <div className="map-empty">
            <Empty
              title="Joylashuvingiz aniqlanmagan"
              hint="Yaqin atrofdagi sheriklarni ko'rish uchun joylashuvingizni ulashing."
              action={
                <Button onClick={locate} loading={locating}>
                  <LocateIcon size={16} /> Joylashuvni aniqlash
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="me-dot" style={{ left: '50%', top: `${MAP_CY}%` }} title="Siz" />
            {users.map((u) => (
              <button
                key={u.id}
                className={`pin ${PIN_COLORS[u.avatarColor] ?? ''} ${selected === u.id ? 'selected' : ''}`}
                style={{ left: `${50 + (u.dx / scale) * 44}%`, top: `${MAP_CY - (u.dy / scale) * MAP_RY}%` }}
                onClick={() => {
                  setSelected(u.id);
                  document.getElementById(`near-${u.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
                aria-label={`${u.name}, ${u.distanceKm} km`}
              >
                {u.name.charAt(0)}
              </button>
            ))}
            <button className="map-locate" onClick={locate} aria-label="Joylashuvni yangilash" title="Joylashuvni yangilash">
              {locating ? <span className="spinner" /> : <LocateIcon size={18} />}
            </button>
          </>
        )}
      </div>

      <aside className="near-panel">
        <h3>Yaqin atrofda ({users.length})</h3>
        {error && <ErrorBox message={error} onRetry={() => reload()} />}
        {me.lat != null && !error && users.length === 0 && <Empty title="Hech kim topilmadi" hint="Boshqa filtrni tanlab ko'ring." />}
        {users.map((u) => (
          <div key={u.id} id={`near-${u.id}`} className={`card near ${selected === u.id ? 'selected' : ''}`} onMouseEnter={() => setSelected(u.id)}>
            <div className="person-row">
              <Avatar name={u.name} color={u.avatarColor} size={44} />
              <div className="person-text">
                <b>{u.name}</b>
                <small>
                  {u.place} · {u.distanceKm} km
                </small>
              </div>
            </div>
            {(u.subject || u.isStudying) && (
              <div className="tags">
                {u.subject && <Tag>{u.subject}</Tag>}
                {u.isStudying && <Tag>Hozir faol</Tag>}
              </div>
            )}
            <div className="btn-row">
              <Button onClick={() => navigate(`/chat/${u.id}?join=1`)}>Qo'shilish</Button>
              <Button variant="secondary" onClick={() => navigate(`/u/${u.id}`)}>
                Profil
              </Button>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
