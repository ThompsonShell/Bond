import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, resetDb, tx, type DB } from './db.js';
import { promptFor } from './routes/home.js';
import { addDays, dayOf } from './util.js';

export const DEMO_EMAIL = 'aziz@bondi.uz';
export const DEMO_PASSWORD = 'bondi1234';

// Registon (Tashkent centre) is the demo user's location.
const BASE = { lat: 41.3111, lng: 69.2797 };
const at = (dLatKm: number, dLngKm: number) => ({
  lat: BASE.lat + dLatKm / 111,
  lng: BASE.lng + dLngKm / (111 * Math.cos((BASE.lat * Math.PI) / 180)),
});

interface SeedUser {
  key: string;
  name: string;
  username: string;
  color: string;
  bio: string;
  subject: string;
  place: string;
  placeType: string;
  schedule: string;
  interests: string[];
  pos?: { lat: number; lng: number };
  studying?: boolean;
}

const USERS: SeedUser[] = [
  {
    key: 'aziz',
    name: 'Aziz Toshmatov',
    username: 'aziz_study',
    color: 'green',
    bio: "IELTS 7.0 ga tayyorlanayapman. Asosan writing va speaking bo'yicha sherik izlayapman. Ertalab soat 7–11 orasida eng samarali ishlayman. Registon co-work eng sevimli joyim.",
    subject: 'IELTS Writing',
    place: 'Registon Co-work',
    placeType: 'cowork',
    schedule: 'morning',
    interests: ['IELTS', 'English', 'Speaking', 'Writing'],
    pos: at(0, 0),
  },
  {
    key: 'sardor',
    name: 'Sardor Karimov',
    username: 'sardor_k',
    color: 'green',
    bio: "IELTS Writing Task 2 ustida ishlayapman. Har kuni Registon co-workda bo'laman.",
    subject: 'IELTS Writing',
    place: 'Registon',
    placeType: 'cowork',
    schedule: 'morning',
    interests: ['IELTS', 'Writing', 'English'],
    pos: at(1.6, -1.4),
    studying: true,
  },
  {
    key: 'madina',
    name: 'Madina Umarova',
    username: 'madina_u',
    color: 'orange',
    bio: "Speaking bo'yicha har kuni online mashq qilaman.",
    subject: 'Speaking',
    place: 'Online',
    placeType: 'online',
    schedule: 'morning',
    interests: ['IELTS', 'Speaking', 'English'],
    pos: at(-0.9, -2.4),
    studying: true,
  },
  {
    key: 'jasur',
    name: 'Jasur Alimov',
    username: 'jasur_dev',
    color: 'blue',
    bio: "Python va web dasturlash. Yangi loyihalar uchun sherik qidiryapman.",
    subject: 'Programming',
    place: 'Kafe Uno',
    placeType: 'cafe',
    schedule: 'day',
    interests: ['Programming', 'English'],
    pos: at(2.2, 2.4),
    studying: true,
  },
  {
    key: 'nilufar',
    name: 'Nilufar Saidova',
    username: 'nilufar_s',
    color: 'amber',
    bio: 'SAT Math va Reading. Kutubxonada jim ishlashni yoqtiraman.',
    subject: 'SAT',
    place: 'Kutubxona',
    placeType: 'library',
    schedule: 'day',
    interests: ['SAT', 'Math', 'Reading'],
    pos: at(-3.4, 3.4),
    studying: true,
  },
  {
    key: 'dilnoza',
    name: 'Dilnoza Rahimova',
    username: 'dilnoza_r',
    color: 'green',
    bio: "Ertalab o'qishni yoqtiradi. IELTS 7.5 ga tayyorlanmoqda.",
    subject: 'Speaking',
    place: 'Registon Co-work',
    placeType: 'cowork',
    schedule: 'morning',
    interests: ['IELTS', 'Speaking', 'English', 'Writing'],
    pos: at(0.8, 1.2),
  },
  {
    key: 'otabek',
    name: 'Otabek Yunusov',
    username: 'otabek_y',
    color: 'orange',
    bio: "Python va ingliz tilini birga o'rganmoqda.",
    subject: 'Programming',
    place: 'Online',
    placeType: 'online',
    schedule: 'day',
    interests: ['Programming', 'English', 'Speaking'],
    pos: at(-6, -5),
  },
  {
    key: 'zarina',
    name: 'Zarina Karimova',
    username: 'zarina_k',
    color: 'blue',
    bio: 'Mock test birga ishlashni xohlaydi.',
    subject: 'Listening',
    place: 'Kutubxona',
    placeType: 'library',
    schedule: 'evening',
    interests: ['IELTS', 'Listening', 'English'],
    pos: at(-8, 6),
  },
  {
    key: 'bekzod',
    name: 'Bekzod Rahimov',
    username: 'bekzod_r',
    color: 'rust',
    bio: 'SAT 1500+ ga tayyorlanmoqda.',
    subject: 'Math',
    place: 'Kutubxona',
    placeType: 'library',
    schedule: 'morning',
    interests: ['SAT', 'Math', 'English'],
    pos: at(9, -7),
  },
  {
    key: 'laylo',
    name: 'Laylo Nazarova',
    username: 'laylo_n',
    color: 'rose',
    bio: 'Figma va prototiplashda tajriba almashish.',
    subject: 'UI/UX',
    place: 'Online',
    placeType: 'online',
    schedule: 'evening',
    interests: ['Design', 'English'],
  },
  {
    key: 'ruslan',
    name: 'Ruslan Yakubov',
    username: 'ruslan_y',
    color: 'indigo',
    bio: 'Fizika olimpiadasiga birga tayyorlanish.',
    subject: 'Olimpiada',
    place: 'Kutubxona',
    placeType: 'library',
    schedule: 'evening',
    interests: ['Physics', 'Olimpiada', 'Math'],
    pos: at(12, 10),
  },
];

/** SQLite datetime string `minutesAgo` minutes in the past (UTC). */
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString().replace('T', ' ').slice(0, 19);
}

/** Today at HH:MM in Asia/Tashkent (UTC+5), as ISO. */
function todayAt(hh: number, mm = 0): string {
  const d = dayOf();
  return new Date(`${d}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+05:00`).toISOString();
}

export async function seed(db: DB) {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const ids: Record<string, number> = {};
  const today = dayOf();

  tx(db, () => {
    const insUser = db.prepare(
      `INSERT INTO users (name, email, username, password_hash, bio, avatar_color, subject, place, place_type, schedule,
                          lat, lng, is_studying, onboarded, last_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    );
    const insInterest = db.prepare('INSERT INTO interests (user_id, tag) VALUES (?, ?)');
    for (const u of USERS) {
      const email = u.key === 'aziz' ? DEMO_EMAIL : `${u.key}@bondi.uz`;
      const info = insUser.run(
        u.name,
        email,
        u.username,
        hash,
        u.bio,
        u.color,
        u.subject,
        u.place,
        u.placeType,
        u.schedule,
        u.pos?.lat ?? null,
        u.pos?.lng ?? null,
        u.studying ? 1 : 0,
        u.studying ? ago(2) : ago(60 * 24),
      );
      ids[u.key] = Number(info.lastInsertRowid);
      for (const t of u.interests) insInterest.run(ids[u.key], t);
    }

    // Aziz has 12 partners; 3 of them joined this week.
    const insConn = db.prepare('INSERT OR IGNORE INTO connections (user_id, partner_id, created_at) VALUES (?, ?, ?)');
    const partners = ['sardor', 'madina', 'jasur', 'nilufar'];
    partners.forEach((k, i) => {
      const when = ago(i < 3 ? 60 * 24 * (i + 1) : 60 * 24 * 30);
      insConn.run(ids.aziz, ids[k], when);
      insConn.run(ids[k], ids.aziz, when);
    });
    // Extra (non-demo-card) partners so the counters look like the design.
    const extra = db.prepare(
      `INSERT INTO users (name, email, username, password_hash, avatar_color, hidden, onboarded) VALUES (?, ?, ?, ?, 'green', 1, 1)`,
    );
    for (let i = 1; i <= 8; i++) {
      const id = Number(extra.run(`Sherik ${i}`, `partner${i}@bondi.uz`, `partner_${i}`, hash).lastInsertRowid);
      insConn.run(ids.aziz, id, ago(60 * 24 * 40));
      insConn.run(id, ids.aziz, ago(60 * 24 * 40));
    }

    // Study history: 48 hours in total, 12 hours this week.
    const insLog = db.prepare('INSERT INTO study_logs (user_id, title, place, partner_id, minutes, day) VALUES (?, ?, ?, ?, ?, ?)');
    insLog.run(ids.aziz, 'IELTS Writing Task 2', 'Registon Co-work', ids.sardor, 120, addDays(today, -1));
    insLog.run(ids.aziz, 'Speaking Practice', 'Online', ids.madina, 60, addDays(today, -2));
    insLog.run(ids.aziz, 'Reading Practice', 'Kutubxona', ids.nilufar, 90, addDays(today, -3));
    insLog.run(ids.aziz, 'Mock Test', 'Registon Co-work', null, 180, addDays(today, -4));
    insLog.run(ids.aziz, 'Vocabulary', 'Online', null, 270, addDays(today, -5));
    for (let i = 0; i < 12; i++) insLog.run(ids.aziz, 'Mustaqil o\'qish', 'Uyda', null, 180, addDays(today, -10 - i * 3));

    // Daily essays: 8 total, 5-day streak ending yesterday.
    const insEssay = db.prepare('INSERT INTO essays (user_id, prompt, body, day) VALUES (?, ?, ?, ?)');
    const essayDays = [1, 2, 3, 4, 5, 9, 12, 15];
    for (const n of essayDays) {
      const d = addDays(today, -n);
      insEssay.run(ids.aziz, promptFor(d), "Bugun yangi so'zlarni takrorladim va Sardor bilan writing ustida ishladik.", d);
    }

    // Today's session at Registon with Sardor & Madina.
    const insSession = db.prepare(
      'INSERT INTO study_sessions (creator_id, invitee_id, title, place, starts_at, duration_min, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    const insPart = db.prepare('INSERT INTO session_participants (session_id, user_id) VALUES (?, ?)');
    const todays = Number(insSession.run(ids.sardor, ids.madina, 'IELTS Writing', 'Registon Co-work', todayAt(15), 120, 'accepted').lastInsertRowid);
    insPart.run(todays, ids.sardor);
    insPart.run(todays, ids.madina);

    // Sardor's pending invite to Aziz (shown in chat + notifications).
    const invite = Number(
      insSession.run(ids.sardor, ids.aziz, 'IELTS Writing — Task 2', 'Registon Co-work', todayAt(15), 120, 'proposed').lastInsertRowid,
    );
    insPart.run(invite, ids.sardor);

    const insMsg = db.prepare('INSERT INTO messages (sender_id, receiver_id, body, kind, session_id, read_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const conv: [string, string, string, number, boolean][] = [
      ['jasur', 'aziz', "Programming bo'yicha yangi loyiha?", 60 * 26, true],
      ['madina', 'aziz', 'Salom! Ertaga speaking qilamizmi?', 70, true],
      ['aziz', 'madina', 'Albatta, soat 10 da online.', 65, true],
      ['madina', 'aziz', "Speaking practice juda yaxshi o'tdi!", 60, true],
      ['sardor', 'aziz', "Salom! IELTS writing bo'yicha birga tayyorlanishni xohlaysizmi?", 18, true],
      ['aziz', 'sardor', 'Ha, albatta! Qachon qulay?', 15, true],
      ['sardor', 'aziz', "Bugun soat 3 da Registon co-workingda bo'laman. Qo'shilasizmi?", 12, false],
    ];
    for (const [from, to, body, min, read] of conv) {
      insMsg.run(ids[from], ids[to], body, 'text', null, read ? ago(min - 1) : null, ago(min));
    }
    insMsg.run(ids.sardor, ids.aziz, '', 'session', invite, null, ago(2));

    const insNote = db.prepare(
      'INSERT INTO notifications (user_id, kind, actor_id, session_id, title, body, read_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    );
    insNote.run(ids.aziz, 'new_match', ids.dilnoza, null, 'Yangi mos sherik — Dilnoza', '94% moslik', ago(60 * 20), ago(60 * 22));
    insNote.run(ids.aziz, 'streak', null, null, 'Kunlik inshongiz kutmoqda!', '5 kunlik seriyani saqlang', ago(60 * 20), ago(60 * 23));
    insNote.run(ids.aziz, 'nearby', ids.madina, null, "Madina yaqinda o'qimoqda!", 'Kafe Uno · 500m', null, ago(20));
    insNote.run(ids.aziz, 'session_invite', ids.sardor, invite, 'Sardor sizga taklif yubordi', '', null, ago(5));
  });
}

export async function seedIfEmpty(db: DB) {
  const n = (db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
  if (n === 0) {
    await seed(db);
    console.log(`Demo ma'lumotlar yuklandi. Kirish: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }
}

// `npm run seed` — wipe and re-seed the database.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const db = openDb(process.env.DB_PATH || path.join(root, 'bondi.db'));
  if (process.argv.includes('--reset')) resetDb(db);
  await seed(db);
  console.log(`Tayyor. Kirish: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}
