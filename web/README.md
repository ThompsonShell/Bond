# bondi — web (Next.js)

The 13 pages of the Bondi app, built from the `bondi-design` handoff (HANDOFF.md).

- **Stack:** Next.js (App Router), React, TypeScript, CSS Modules. No extra libraries.
- **Font:** Geist (`next/font/google`).
- **Themes:** `olxori` (default), `olxori-yorug`, `binafsha`, `binafsha-tungi` — defined in `src/app/globals.css`. The theme is set via `<html data-theme>`; the dark/light choice on the Settings page is stored in a cookie. To switch to the binafsha palette, set `NEXT_PUBLIC_THEME_FAMILY=binafsha`.
- **UI language:** Uzbek. Code, comments and docs are in English.

## Getting started

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Structure

```
src/
  app/
    (auth)/          login, register, reset-password, onboarding/1, onboarding/2
    (app)/           home (/), chats, matching, discover, events, profile, notifications, settings
    api/             route handlers on top of the mock data layer
    globals.css      colour tokens and base styles
  components/
    ui/              shared components (HANDOFF §7): Button, Card, Avatar, Badge, Chip, MatchPercent,
                     Field/Input, Tabs, ToggleChip, Switch, DateTile, EmptyState, InlineError, StatusLine, NavItem
    shell/           app shell (sidebar, unread badges) and the sign-in card frame
  features/          interactive parts of each page
  lib/
    mock-data.ts     sample data, in one place
    server/store.ts  data layer — replace this file when the real backend is ready
    api.ts           browser-side API client
```

## Data

Server components read from `lib/server/store.ts`; mutations go through `/api/*`. Sample data lives in `lib/mock-data.ts`. The store is in memory, so restarting the server resets it to the sample state.

The sidebar badges are computed from real state: they go down when a chat is opened or a notification is read, and disappear at zero.

## Not in the design (HANDOFF §12) — not implemented

- Real authentication: sign-in and sign-up are mocked (any well-formed email is accepted). The Google/GitHub buttons show a "not connected yet" message.
- Image upload and the comment list: the buttons are shown but disabled.
- Other users' profiles, Groups/Friends pages, loading and network-error states.
- Bottom navigation for phones: on narrow screens the menu stacks above the content (the design's `flex-wrap` behaviour).
