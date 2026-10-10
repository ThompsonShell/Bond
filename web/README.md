# bondi — web (Next.js)

Bondi ilovasining 13 ta sahifasi `bondi-design` topshirig'i (HANDOFF.md) asosida.

- **Stack:** Next.js (App Router), React, TypeScript, CSS Modules. Qo'shimcha kutubxona yo'q.
- **Shrift:** Geist (`next/font/google`).
- **Mavzular:** `olxori` (standart), `olxori-yorug`, `binafsha`, `binafsha-tungi` — `src/app/globals.css`. Mavzu `<html data-theme>` orqali beriladi, Sozlamalardagi Tungi/Yorug' tanlovi cookie'da saqlanadi. Binafsha palitrasiga o'tish: `NEXT_PUBLIC_THEME_FAMILY=binafsha`.

## Ishga tushirish

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Tuzilma

```
src/
  app/
    (auth)/          login, register, reset-password, onboarding/1, onboarding/2
    (app)/           bosh sahifa (/), chats, matching, discover, events, profile, notifications, settings
    api/             route handler'lar (mock ma'lumot qatlami ustida)
    globals.css      rang tokenlari va bazaviy stil
  components/
    ui/              umumiy komponentlar (HANDOFF §7): Button, Card, Avatar, Badge, Chip, MatchPercent,
                     Field/Input, Tabs, ToggleChip, Switch, DateTile, EmptyState, InlineError, StatusLine, NavItem
    shell/           ilova qobig'i (chap menyu, badge'lar), kirish oqimi kartasi
  features/          sahifalarning interaktiv qismlari
  lib/
    mock-data.ts     namuna ma'lumot (bitta joyda)
    server/store.ts  ma'lumot qatlami — backend tayyor bo'lganda shu faylni almashtiring
    api.ts           brauzer uchun API klienti
```

## Ma'lumot

Sahifalar ma'lumotni `lib/server/store.ts` (server komponentlarda) va `/api/*` (o'zgartirishlar) orqali oladi; namunalar `lib/mock-data.ts` da. Store xotirada ishlaydi — server qayta ishga tushsa, namuna holatiga qaytadi.

Menyudagi badge'lar haqiqiy holatdan hisoblanadi: suhbat ochilganda yoki bildirishnoma o'qilganda kamayadi, nol bo'lsa ko'rinmaydi.

## Dizaynda yo'q (HANDOFF §12) — qilinmagan

- Haqiqiy autentifikatsiya: kirish/ro'yxat mock (har qanday to'g'ri email qabul qilinadi). Google/GitHub tugmalari "hali ulanmagan" xabarini ko'rsatadi.
- Rasm yuklash va izohlar ro'yxati: tugmalar ko'rinadi, lekin o'chirilgan.
- Boshqa odam profili, Guruhlar/Do'stlar sahifalari, loading va tarmoq xatosi holatlari.
- Telefon uchun pastki navigatsiya: tor ekranda menyu tepada, kontent ostida (dizayndagi `flex-wrap` xatti-harakati).
