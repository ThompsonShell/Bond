# Bondi — study · connect · grow

Bondi o'quv sherigini topish platformasi: yaqin atrofdagi studentlarni xaritada ko'rish, AI moslik bo'yicha sherik topish, chat orqali o'quv seanslarini rejalashtirish va kunlik maqola yozib seriyani saqlash.

Dizayn manbasi: [`design/bondi-web.html`](design/bondi-web.html) (desktop) va [`design/bondi-app.html`](design/bondi-app.html) (mobil). Frontend ikkala dizaynni ham bitta moslashuvchan (responsive) ilovada amalga oshiradi: keng ekranda sidebar, 860px dan torda pastki tab bar. **Green** va **Light** rejimlari bor.

## Texnologiyalar

| Qism     | Stek                                                                 |
| -------- | -------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, React Router                             |
| Backend  | Node.js 22, Express 5, TypeScript, SQLite (`node:sqlite`), JWT, Multer |
| Testlar  | `node:test` (API integratsiya testlari)                              |

Tashqi ma'lumotlar bazasi kerak emas: SQLite fayli birinchi ishga tushirishda avtomatik yaratiladi va demo ma'lumotlar bilan to'ldiriladi.

## Ishga tushirish

Talab: **Node.js 22.5+**

```bash
npm install
npm run dev          # backend :4000 + frontend :5173
```

Brauzerda http://localhost:5173 ni oching.

**Demo hisob:** `aziz@bondi.uz` / `bondi1234` (boshqa demo foydalanuvchilar: `sardor@`, `madina@`, `dilnoza@`, `bekzod@`… `@bondi.uz`, parol bir xil).

### Production

```bash
npm run build        # client/dist + server/dist
npm start            # http://localhost:4000 — API va frontend bitta serverda
```

### Boshqa buyruqlar

```bash
npm test             # backend API testlari
npm run typecheck    # server + client TypeScript tekshiruvi
npm run seed         # bazani tozalab, demo ma'lumotlarni qayta yuklash
```

### Muhit o'zgaruvchilari

`.env.example` ga qarang: `PORT`, `JWT_SECRET` (productionda albatta o'zgartiring), `DB_PATH`, `UPLOAD_DIR`, `APP_TZ` (standart `Asia/Tashkent`).

## Sahifalar

| Yo'l             | Dizayndagi ekran                       | Nima qiladi                                                                 |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `/login`         | Kirish                                 | Email yoki username + parol bilan kirish                                     |
| `/register`      | Ro'yxat                                | Ro'yxatdan o'tish, username bandligini jonli tekshirish                      |
| `/onboarding`    | About Me, Interests                    | Bio va kamida 3 ta qiziqish tanlash                                          |
| `/home`          | Bosh sahifa                            | Statistika, kunlik maqola, bugungi seanslar, hozir o'qiyotganlar             |
| `/map`           | Xarita                                 | Yaqin atrofdagi sheriklar, filtrlar (Co-work, Kutubxona, Kafe), geolokatsiya |
| `/chat`, `/chat/:id` | Xabarlar, Chat suhbat              | Suhbatlar ro'yxati, xabarlar, o'quv seans taklifi (qabul/rad)                |
| `/matching`      | Mos sheriklar / AI Matching            | Moslik foizi bo'yicha saralangan sheriklar, "Bog'lanish"                     |
| `/profile`, `/u/:id` | Profil                             | Profil, statistika, qiziqishlar, video taqdimot, yaqinda o'qiganlar, tahrirlash |
| `/notifications` | Bildirishnomalar                       | Takliflar, yangi sheriklar, yaqin atrofdagilar                               |
| `/settings`      | Sozlamalar                             | Rejim (Yashil/Yorug'), joylashuvni ko'rsatish, profilni yashirish, chiqish  |

## API

Barcha himoyalangan so'rovlar `Authorization: Bearer <token>` sarlavhasini talab qiladi.

| Metod | Yo'l | Tavsif |
| ----- | ---- | ------ |
| POST | `/api/auth/register` | `{ name, email, password, username }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| GET | `/api/auth/username-available?u=` | Username bandligi |
| PATCH | `/api/users/me` | Profil va sozlamalarni yangilash |
| POST / DELETE | `/api/users/me/video` | Video taqdimot yuklash (multipart `video`, maks. 50 MB) / o'chirish |
| GET | `/api/users/interests` | Qiziqishlar ro'yxati |
| GET | `/api/users/studying-now` | Hozir o'qiyotganlar |
| GET | `/api/users/nearby?filter=all\|cowork\|library\|cafe&q=` | Xarita uchun yaqin atrofdagilar |
| GET | `/api/users/matches` | AI moslik bo'yicha sheriklar |
| GET | `/api/users/:id` | Profil + statistika + moslik |
| POST | `/api/users/:id/connect` | Sherik bo'lish |
| GET | `/api/stats/me` | Soatlar, sheriklar, maqolalar, seriya |
| GET / POST | `/api/essays/today`, `/api/essays` | Kunlik maqola |
| GET | `/api/sessions/today` | Bugungi seanslar |
| POST | `/api/sessions` | Seans taklif qilish `{ partnerId, title, place, startsAt, durationMin }` |
| POST | `/api/sessions/:id/respond` | `{ accept: boolean }` |
| POST / DELETE | `/api/sessions/:id/join` | Seansga qo'shilish / chiqish |
| GET | `/api/chat/conversations?filter=all\|unread&q=` | Suhbatlar |
| GET / POST | `/api/chat/conversations/:userId/messages` | Xabarlar (o'qilgan deb belgilanadi) / yuborish |
| GET | `/api/chat/unread` | O'qilmagan xabar va bildirishnomalar soni |
| GET | `/api/notifications` | Bildirishnomalar |
| POST | `/api/notifications/read-all` | Hammasini o'qilgan qilish |

### AI moslik qanday hisoblanadi

`server/src/matching.ts` — umumiy qiziqishlar (Jaccard o'xshashligi, eng katta vazn), bir xil o'qish vaqti ("Bir xil soat"), bir xil fan, masofa ("Yaqin hudud") va shahar asosida 1–99% ball.

## Loyiha tuzilmasi

```
design/          Claude Design'dan eksport qilingan asl dizaynlar
server/src/
  app.ts         Express ilova (API + production'da frontend)
  db.ts          SQLite sxema
  seed.ts        Demo ma'lumotlar
  matching.ts    Moslik algoritmi
  routes/        auth, users, home (statistika/maqola/seanslar), chat (+ bildirishnomalar)
  app.test.ts    API testlari
client/src/
  pages/         Har bir ekran
  components/    Layout (sidebar/tab bar), UI elementlar, ikonlar, seans kartalari
  state.tsx      Auth, rejim, o'qilmaganlar, toast
  styles.css     Dizayn tokenlari (Green/Light) va stillar
```

## Hozircha yo'q

- Google/Apple orqali kirish va parolni tiklash (tugmalar bor, lekin xabar ko'rsatadi — OAuth va email xizmati sozlanishi kerak).
- Real-time chat WebSocket o'rniga polling (3 soniya) orqali ishlaydi.
- Interfeys faqat o'zbek tilida.
