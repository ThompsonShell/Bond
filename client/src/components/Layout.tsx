import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp, useMe } from '../state';
import { BackIcon, ChatIcon, HomeIcon, LoginIcon, LogoutIcon, PinIcon, UserIcon, UserPlusIcon } from './Icons';
import { Avatar, Logo } from './ui';

interface NavDef {
  to: string;
  label: string;
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

/** The "🌿 Green / ☀️ Light" pill from the design files. */
export function ModeBar() {
  const { theme, setTheme } = useApp();
  // Keep the chat composer clear.
  if (useLocation().pathname.startsWith('/chat')) return null;
  return (
    <div className="modebar" role="group" aria-label="Rejim">
      <button className={theme === 'green' ? 'on' : ''} onClick={() => setTheme('green')}>
        🌿 Green
      </button>
      <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}>
        ☀️ Light
      </button>
    </div>
  );
}

export function AppLayout() {
  const me = useMe();
  const { unread, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Sidebar items — bondi-web.html
  const side: NavDef[] = [
    { to: '/home', label: 'Bosh sahifa', icon: (p) => <HomeIcon {...p} /> },
    { to: '/map', label: 'Xarita', icon: (p) => <PinIcon {...p} /> },
    { to: '/chat', label: 'Xabarlar', icon: (p) => <ChatIcon {...p} />, badge: unread.messages },
    { to: '/matching', label: 'Mos sheriklar', icon: (p) => <UserPlusIcon {...p} /> },
    { to: '/profile', label: 'Profil', icon: (p) => <UserIcon {...p} /> },
  ];
  // Bottom tab bar — bondi-app.html
  const tabs: NavDef[] = [
    { to: '/home', label: 'Bosh sahifa', icon: (p) => <HomeIcon {...p} /> },
    { to: '/map', label: 'Xarita', icon: (p) => <PinIcon {...p} /> },
    { to: '/chat', label: 'Chat', icon: (p) => <ChatIcon {...p} />, badge: unread.messages },
    { to: '/profile', label: 'Profil', icon: (p) => <UserIcon {...p} /> },
  ];

  // The full-screen conversation hides the tab bar (as in the app design).
  const hideTabs = /^\/chat\/\d+/.test(pathname);
  // Social/discovery screens use the darker background on mobile.
  const deep = !/^\/(home|map)/.test(pathname);

  return (
    <div className="shell">
      <aside className="side">
        <Logo />
        <SideNav items={side} />
        <div className="side-user">
          <button className="side-user-main" onClick={() => navigate('/settings')} title="Sozlamalar">
            <Avatar name={me.name} color={me.avatarColor} size={40} radius={12} />
            <span className="side-user-text">
              <b>{me.name}</b>
              <small>@{me.username}</small>
            </span>
          </button>
          <button
            className="side-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            aria-label="Chiqish"
            title="Chiqish"
          >
            <LogoutIcon size={16} />
          </button>
        </div>
      </aside>

      <main className={`main ${deep ? 'main-deep' : ''}`}>
        <Outlet />
      </main>

      {!hideTabs && (
        <nav className="tabbar">
          {tabs.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
              {({ isActive }) => (
                <>
                  <span className="tab-icon">
                    {it.icon({ filled: isActive })}
                    {!!it.badge && <em className="tab-badge">{it.badge}</em>}
                  </span>
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
      <ModeBar />
    </div>
  );
}

export function AuthLayout() {
  const items: NavDef[] = [
    { to: '/login', label: 'Kirish', icon: (p) => <LoginIcon {...p} /> },
    { to: '/register', label: "Ro'yxat", icon: (p) => <UserPlusIcon {...p} /> },
    { to: '/home', label: 'Bosh sahifa', icon: (p) => <HomeIcon {...p} /> },
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
      <ModeBar />
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
          {subtitle && <div className="page-sub">{subtitle}</div>}
        </div>
      </div>
      {right && <div className="page-head-right">{right}</div>}
    </header>
  );
}
