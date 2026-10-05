import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { get, patch, post, setUnauthorizedHandler, tokenStore, type Me, type Theme } from './api';

interface AuthResult {
  token: string;
  user: Me;
}

interface AppState {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Me>;
  register: (data: { name: string; email: string; password: string; username: string }) => Promise<Me>;
  logout: () => void;
  updateMe: (data: Partial<Record<string, unknown>>) => Promise<Me>;
  setUser: (u: Me) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  unread: { messages: number; notifications: number };
  refreshUnread: () => void;
  toast: (msg: string, kind?: 'ok' | 'error' | 'info') => void;
}

const Ctx = createContext<AppState | null>(null);

const THEME_KEY = 'bondi.theme';
function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'green';
  } catch {
    return 'green';
  }
}

interface Toast {
  id: number;
  msg: string;
  kind: 'ok' | 'error' | 'info';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<Theme>(storedTheme);
  const [unread, setUnread] = useState({ messages: 0, notifications: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const applyTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'light' ? '#EAE0CA' : '#0B2818');
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => applyTheme(theme), []); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptUser = useCallback(
    (u: Me) => {
      setUser(u);
      applyTheme(u.theme);
    },
    [applyTheme],
  );

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    setUnread({ messages: 0, notifications: 0 });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    get<{ user: Me }>('/auth/me')
      .then((r) => acceptUser(r.user))
      .catch(() => tokenStore.set(null))
      .finally(() => setTimeout(() => setLoading(false), 350));
  }, [acceptUser, logout]);

  const refreshUnread = useCallback(() => {
    if (!tokenStore.get()) return;
    get<{ messages: number; notifications: number }>('/chat/unread')
      .then(setUnread)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshUnread();
    const t = setInterval(refreshUnread, 10_000);
    return () => clearInterval(t);
  }, [user?.id, refreshUnread]); // eslint-disable-line react-hooks/exhaustive-deps

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'ok') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const r = await post<AuthResult>('/auth/login', { email, password });
        tokenStore.set(r.token);
        acceptUser(r.user);
        return r.user;
      },
      async register(data) {
        const r = await post<AuthResult>('/auth/register', data);
        tokenStore.set(r.token);
        setUser(r.user);
        // Keep the theme chosen before signing up.
        if (r.user.theme !== theme) patch<{ user: Me }>('/users/me', { theme }).then((x) => setUser(x.user)).catch(() => {});
        return r.user;
      },
      logout,
      async updateMe(data) {
        const r = await patch<{ user: Me }>('/users/me', data);
        setUser(r.user);
        return r.user;
      },
      setUser,
      theme,
      setTheme(t) {
        applyTheme(t);
        if (user) patch<{ user: Me }>('/users/me', { theme: t }).then((r) => setUser(r.user)).catch(() => {});
      },
      unread,
      refreshUnread,
      toast,
    }),
    [user, loading, acceptUser, logout, theme, applyTheme, unread, refreshUnread, toast],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
}

/** The signed-in user; only call inside authenticated routes. */
export function useMe(): Me {
  const { user } = useApp();
  if (!user) throw new Error('useMe without user');
  return user;
}
