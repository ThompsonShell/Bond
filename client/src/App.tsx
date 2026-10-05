import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout, AuthLayout } from './components/Layout';
import { Login, Onboarding, Register, Splash } from './pages/Auth';
import { ChatPage } from './pages/Chat';
import { Home } from './pages/Home';
import { MapPage } from './pages/MapPage';
import { Matching } from './pages/Matching';
import { Notifications } from './pages/Notifications';
import { MyProfile, UserProfile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { useApp } from './state';

function RequireAuth({ children, onboarding = false }: { children: ReactNode; onboarding?: boolean }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!onboarding && !user.onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (user) return <Navigate to={user.onboarded ? '/home' : '/onboarding'} replace />;
  return <>{children}</>;
}

export default function App() {
  const { loading, user } = useApp();
  if (loading) return <Splash />;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/onboarding" element={<RequireAuth onboarding><Onboarding /></RequireAuth>} />
      </Route>
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/u/:id" element={<UserProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
    </Routes>
  );
}
