'use client';

import { Avatar, Logo, NavItem } from '@/components/ui';
import type { CurrentUser } from '@/lib/types';
import { useCounts } from './CountsProvider';
import s from './shell.module.css';

export function Sidebar({ user }: { user: Pick<CurrentUser, 'name' | 'initials'> }) {
  const { unreadChats, unreadNotifications } = useCounts();
  return (
    <nav className={s.side} aria-label="Asosiy menyu">
      <Logo />
      <NavItem href="/" icon="home">
        <span>Bosh sahifa</span>
      </NavItem>
      <NavItem href="/chats" icon="chat" badge={unreadChats} badgeLabel={`${unreadChats} ta o’qilmagan xabar`}>
        <span>Chatlar</span>
      </NavItem>
      <NavItem href="/discover" icon="compass">
        <span>Kashf etish</span>
      </NavItem>
      <NavItem href="/events" icon="calendar">
        <span>Tadbirlar</span>
      </NavItem>
      <NavItem href="/matching" icon="sparkle">
        <span>AI Matching</span>
      </NavItem>
      <NavItem href="/notifications" icon="bell" badge={unreadNotifications} badgeLabel={`${unreadNotifications} ta o’qilmagan bildirishnoma`}>
        <span>Bildirishnomalar</span>
      </NavItem>
      <NavItem href="/profile" icon="user">
        <span>Profil</span>
      </NavItem>
      <div className={s.sideBottom}>
        <NavItem href="/settings" icon="sliders">
          <span>Sozlamalar</span>
        </NavItem>
        <NavItem href="/profile">
          <Avatar initials={user.initials} size={32} self />
          <span className={s.userName}>{user.name}</span>
        </NavItem>
      </div>
    </nav>
  );
}
