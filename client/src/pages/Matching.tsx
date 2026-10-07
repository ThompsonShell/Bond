import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { post, type MatchUser } from '../api';
import { Avatar, Button, Empty, ErrorBox, Loader, Tag } from '../components/ui';
import { PageHeader } from '../components/Layout';
import { errMsg, firstName, useFetch, useIsMobile } from '../lib';
import { useApp } from '../state';

export function Matching() {
  const { toast } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();
  const { data, setData, loading, error, reload } = useFetch<{ users: MatchUser[] }>('/users/matches');
  const [busy, setBusy] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const users = (data?.users ?? []).filter(
    (u) => !q || [u.name, u.username, u.subject, ...u.interests].some((s) => s.toLowerCase().includes(q)),
  );

  async function connect(u: MatchUser) {
    setBusy(u.id);
    try {
      await post(`/users/${u.id}/connect`);
      setData((d) => (d ? { users: d.users.map((x) => (x.id === u.id ? { ...x, connected: true } : x)) } : d));
      toast(`${firstName(u.name)} bilan bog'landingiz!`);
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page match-page">
      <PageHeader
        title="Sizga mos sheriklar"
        subtitle={
          data
            ? isMobile
              ? 'AI sizning qiziqishlaringizga mos topdi'
              : `AI qiziqishlaringizga mos ${users.length} ta sherik topdi${q ? ` · “${q}”` : ''}`
            : 'AI sheriklarni tahlil qilmoqda…'
        }
      />
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorBox message={error} onRetry={() => reload()} />
      ) : users.length === 0 ? (
        <Empty title="Mos sherik topilmadi" hint="Profilingizga ko'proq qiziqish qo'shing — moslik aniqroq bo'ladi." />
      ) : (
        <div className="match-grid">
          {users.map((u) => (
            <article key={u.id} className="card match">
              <div className="match-top">
                <Avatar name={u.name} color={u.avatarColor} size={56} radius={16} />
                <Score value={u.score} />
              </div>
              <div className="match-head-m">
                <Avatar name={u.name} color={u.avatarColor} size={48} radius={16} />
                <button className="person-text" onClick={() => navigate(`/u/${u.id}`)}>
                  <b>{u.name}</b>
                  <small>{subline(u)}</small>
                </button>
                <Score value={u.score} />
              </div>
              <button className="match-name desk-only" onClick={() => navigate(`/u/${u.id}`)}>
                {u.name}
              </button>
              <div className="match-sub desk-only">{subline(u)}</div>
              <p className="match-bio">{u.bio}</p>
              {u.reasons.length > 0 && (
                <div className="tags">
                  {u.reasons.map((r) => (
                    <Tag key={r}>{r}</Tag>
                  ))}
                </div>
              )}
              {u.connected ? (
                <Button block variant="secondary" onClick={() => navigate(`/chat/${u.id}`)}>
                  Xabar yozish
                </Button>
              ) : (
                <Button block loading={busy === u.id} onClick={() => connect(u)}>
                  Bog'lanish
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Score({ value }: { value: number }) {
  return (
    <div className="score">
      <b>{value}%</b>
      <small>moslik</small>
    </div>
  );
}

function subline(u: MatchUser) {
  return [u.interests[0], u.subject].filter((v, i, a) => v && a.indexOf(v) === i).join(' · ');
}
