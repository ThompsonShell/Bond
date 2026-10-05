import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp, useMe } from '../state';
import { BackIcon, ChatIcon, HomeIcon, LoginIcon, LogoutIcon, PinIcon, SettingsIcon, UserIcon, UserPlusIcon } from './Icons';
import { Avatar, Logo } from './ui';

interface NavDef {
  to: string;
  label: string;
  short: string;
  icon: (p: { filled?: boolean }) => ReactNode;
  badge?: number;
}

function SideNav({ items }: { items: NavDef[] }) {
  return (
    <nav className="side-nav">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          {({ isActive }) => (
            <>
              {it.icon({ filled: isActive })}
              <span>{it.label}</span>
              {!!it.badge && <em className="nav-badge">{it.badge > 99 ? '99+' : it.badge}</em>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const me = useMe();
  const { unread, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items: NavDef[] = [
    { to: '/home', label: 'Bosh sahifa', short: 'Bosh sahifa', icon: (p) => <HomeIcon {...p} /> },
    { to: '/map', label: 'Xarita', short: 'Xarita', icon: (p) => <PinIcon {...p} /> },
    { to: '/chat', label: 'Xabarlar', short: 'Chat', icon: (p) => <ChatIcon {...p} />, badge: unread.messages },
    { to: '/matching', label: 'Mos sheriklar', short: 'Moslik', icon: (p) => <UserPlusIcon {...p} /> },
    { to: '/profile', label: 'Profil', short: 'Profil', icon: (p) => <UserIcon {...p} /> },
  ];

  // Full-screen chat conversation on mobile hides the tab bar (as in the app design).
  const hideTabs = /^\/chat\/\d+/.test(pathname);

  return (
    <div className="shell">
      <aside className="side">
        <Logo />
        <SideNav items={items} />
        <div className="side-user">
          <button className="side-user-main" onClick={() => navigate('/profile')}>
            <Avatar name={me.name} color={me.avatarColor} size={40} radius={12} />
            <span className="side-user-text">
              <b>{me.name}</b>
              <small>@{me.username}</small>
            </span>
          </button>
          <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Sozlamalar" title="Sozlamalar">
            <SettingsIcon size={18} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            aria-label="Chiqish"
            title="Chiqish"
          >
            <LogoutIcon size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>

      {!hideTabs && (
        <nav className="tabbar">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  <span className="tab-icon">
                    {it.icon({ filled: isActive })}
                    {!!it.badge && <em className="tab-badge">{it.badge}</em>}
                  </span>
                  <span>{it.short}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

export function AuthLayout() {
  const items: NavDef[] = [
    { to: '/login', label: 'Kirish', short: 'Kirish', icon: (p) => <LoginIcon {...p} /> },
    { to: '/register', label: "Ro'yxat", short: "Ro'yxat", icon: (p) => <UserPlusIcon {...p} /> },
    { to: '/home', label: 'Bosh sahifa', short: 'Bosh sahifa', icon: (p) => <HomeIcon {...p} /> },
  ];
  return (
    <div className="shell shell-auth">
      <aside className="side">
        <Logo />
        <SideNav items={items} />
      </aside>
      <main className="main main-center">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, right, back }: { title: string; subtitle?: string; right?: ReactNode; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className="page-head">
      <div className="page-head-left">
        {back && (
          <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Orqaga">
            <BackIcon />
          </button>
        )}
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="page-head-right">{right}</div>}
    </header>
  );
}
