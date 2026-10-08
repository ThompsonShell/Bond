import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, ChevronIcon, GlobeIcon, LockIcon, PinIcon, SunIcon } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { Avatar, Toggle } from '../components/ui';
import { errMsg } from '../lib';
import { useApp, useMe } from '../state';

export function Settings() {
  const me = useMe();
  const { updateMe, theme, setTheme, logout, toast, unread } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(key: 'shareLocation' | 'hidden', value: boolean) {
    setBusy(key);
    try {
      await updateMe({ [key]: value });
      toast(
        key === 'hidden'
          ? value
            ? 'Profilingiz boshqalardan yashirildi'
            : "Profilingiz yana ko'rinadi"
          : value
            ? "Joylashuvingiz xaritada ko'rinadi"
            : 'Joylashuv yashirildi',
        'info',
      );
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="page narrow">
      <PageHeader title="Sozlamalar" back />

      <button className="card settings-profile" onClick={() => navigate('/profile')}>
        <Avatar name={me.name} color={me.avatarColor} size={48} radius={14} />
        <span>
          <b>{me.name}</b>
          <small>@{me.username}</small>
        </span>
        <ChevronIcon size={18} />
      </button>

      <div className="group-label">Umumiy</div>
      <div className="card settings-group">
        <button className="setting-row" onClick={() => navigate('/notifications')}>
          <BellIcon size={18} />
          <span>Bildirishnomalar</span>
          {unread.notifications > 0 && <em className="nav-badge">{unread.notifications}</em>}
          <ChevronIcon size={16} />
        </button>
        <div className="setting-row">
          <GlobeIcon size={18} />
          <span>Til / Language</span>
          <span className="setting-value">O'zbek</span>
        </div>
        <div className="setting-row">
          <SunIcon size={18} />
          <span>Rejim</span>
          <div className="seg seg-sm">
            <button className={theme === 'green' ? 'active' : ''} onClick={() => setTheme('green')}>
              🌿 Yashil
            </button>
            <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>
              ☀️ Yorug'
            </button>
          </div>
        </div>
      </div>

      <div className="group-label">Maxfiylik</div>
      <div className="card settings-group">
        <div className="setting-row">
          <PinIcon size={18} />
          <span>Joylashuvni ko'rsatish</span>
          <Toggle label="Joylashuvni ko'rsatish" checked={me.shareLocation} onChange={(v) => busy || toggle('shareLocation', v)} />
        </div>
        <div className="setting-row">
          <LockIcon size={18} />
          <span>Profilni yashirish</span>
          <Toggle label="Profilni yashirish" checked={me.hidden} onChange={(v) => busy || toggle('hidden', v)} />
        </div>
      </div>

      <button
        className="logout-btn"
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
      >
        Chiqish
      </button>
    </div>
  );
}
