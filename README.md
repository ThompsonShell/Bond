# Bondi — study · connect · grow

Bondi is a platform for students to find study partners, chat, and go to events together.

This repository contains two separate apps:

| Folder | What it is | Design source |
| ------ | ---------- | ------------- |
| [`web/`](web/README.md) | **New** Next.js app — 13 pages, four colour themes, mock data behind `/api` route handlers | `bondi-design` handoff (HANDOFF.md) |
| `client/` + `server/` | First version — React (Vite) frontend with an Express + SQLite backend | [`design/bondi-web.html`](design/bondi-web.html), [`design/bondi-app.html`](design/bondi-app.html) |

The two apps are independent: `web/` has its own `package.json` and is not part of the root npm workspaces. See [`web/README.md`](web/README.md) for the new app. The rest of this file describes the first version (`client/` + `server/`).

---

## First version (`client/` + `server/`)

A study-partner app: see nearby students on a map, find partners by AI match score, plan study sessions in chat, and keep a streak by writing a daily essay. One responsive frontend covers both designs: a sidebar on wide screens and a bottom tab bar below 860px. **Green** and **Light** modes are available.

### Tech stack

| Part     | Stack                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, React Router                               |
| Backend  | Node.js 22, Express 5, TypeScript, SQLite (`node:sqlite`), JWT, Multer |
| Tests    | `node:test` (API integration tests)                                    |

No external database is needed: the SQLite file is created on first start and filled with demo data.

### Getting started

Requires **Node.js 22.5+**.

```bash
npm install
npm run dev          # backend :4000 + frontend :5173
```

Open http://localhost:5173.

**Demo account:** `aziz@bondi.uz` / `bondi1234` (other demo users: `sardor@`, `madina@`, `dilnoza@`, `bekzod@`… `@bondi.uz`, same password).

#### Production

```bash
npm run build        # client/dist + server/dist
npm start            # http://localhost:4000 — API and frontend on one server
```

#### Other commands

```bash
npm test             # backend API tests
npm run typecheck    # TypeScript check for server + client
npm run seed         # wipe the database and reload demo data
```

#### Environment variables

See `.env.example`: `PORT`, `JWT_SECRET` (always change it in production), `DB_PATH`, `UPLOAD_DIR`, `APP_TZ` (default `Asia/Tashkent`).

### Pages

| Route                | Design screen                | What it does                                                              |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `/login`             | Kirish                       | Sign in with email or username + password                                 |
| `/register`          | Ro'yxat                      | Sign up, with a live username availability check                          |
| `/onboarding`        | About Me, Interests          | Bio and at least 3 interests                                              |
| `/home`              | Bosh sahifa                  | Stats, daily essay, today's sessions, people studying now                 |
| `/map`               | Xarita                       | Nearby partners, filters (co-work, library, café), geolocation            |
| `/chat`, `/chat/:id` | Xabarlar, Chat suhbat        | Conversation list, messages, study session proposals (accept/decline)     |
| `/matching`          | Mos sheriklar / AI Matching  | Partners sorted by match score, "connect" action                          |
| `/profile`, `/u/:id` | Profil                       | Profile, stats, interests, video intro, recent sessions, editing          |
| `/notifications`     | Bildirishnomalar             | Invites, new partners, people nearby                                      |
| `/settings`          | Sozlamalar                   | Theme (Green/Light), location sharing, hide profile, sign out             |

### API

All protected requests require an `Authorization: Bearer <token>` header.

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/auth/register` | `{ name, email, password, username }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/username-available?u=` | Username availability |
| PATCH | `/api/users/me` | Update profile and settings |
| POST / DELETE | `/api/users/me/video` | Upload (multipart `video`, max 50 MB) / delete the video intro |
| GET | `/api/users/interests` | List of interests |
| GET | `/api/users/studying-now` | People studying now |
| GET | `/api/users/nearby?filter=all\|cowork\|library\|cafe&q=` | Nearby people for the map |
| GET | `/api/users/matches` | Partners ranked by AI match score |
| GET | `/api/users/:id` | Profile + stats + match |
| POST | `/api/users/:id/connect` | Become partners |
| GET | `/api/stats/me` | Hours, partners, essays, streak |
| GET / POST | `/api/essays/today`, `/api/essays` | Daily essay |
| GET | `/api/sessions/today` | Today's sessions |
| POST | `/api/sessions` | Propose a session `{ partnerId, title, place, startsAt, durationMin }` |
| POST | `/api/sessions/:id/respond` | `{ accept: boolean }` |
| POST / DELETE | `/api/sessions/:id/join` | Join / leave a session |
| GET | `/api/chat/conversations?filter=all\|unread&q=` | Conversations |
| GET / POST | `/api/chat/conversations/:userId/messages` | Messages (marked as read) / send |
| GET | `/api/chat/unread` | Unread message and notification counts |
| GET | `/api/notifications` | Notifications |
| POST | `/api/notifications/read-all` | Mark all as read |

#### How the AI match score works

`server/src/matching.ts` scores 1–99% from shared interests (Jaccard similarity, the largest weight), the same study time, the same subject, distance, and city.

### Project structure

```
design/          original designs exported from Claude Design
server/src/
  app.ts         Express app (API + frontend in production)
  db.ts          SQLite schema
  seed.ts        demo data
  matching.ts    match algorithm
  routes/        auth, users, home (stats/essays/sessions), chat (+ notifications)
  app.test.ts    API tests
client/src/
  pages/         one file per screen
  components/    layout (sidebar/tab bar), UI elements, icons, session cards
  state.tsx      auth, theme, unread counts, toasts
  styles.css     design tokens (Green/Light) and styles
```

### Not implemented yet

- Google/Apple sign-in and password reset: the buttons exist but only show a message (OAuth and an email service still need to be set up).
- Chat uses polling (every 3 seconds) instead of WebSockets.
- The UI is in Uzbek only.
