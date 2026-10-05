import { Router } from 'express';
import { requireAuth, uid } from '../auth.js';
import { tx, type DB } from '../db.js';
import { addDays, areConnected, dayOf, getUser, HttpError, idParam, notify, publicUser, sqlToIso, str, type UserRow } from '../util.js';

export const ESSAY_PROMPTS = [
  'Bugun eng qiziq narsa nima edi?',
  "Bugun qaysi yangi so'zni o'rgandingiz?",
  'Ertangi kun uchun eng muhim maqsadingiz nima?',
  "Bugun qaysi mavzu sizga qiyin bo'ldi va nega?",
  "O'qishda sizni nima ilhomlantiradi?",
  "Bir hafta oldingi o'zingizga qanday maslahat berardingiz?",
  "Bugun kim sizga yordam berdi yoki siz kimga yordam berdingiz?",
];
export const ESSAY_MAX = 500;

export function promptFor(day: string): string {
  const n = Math.floor(new Date(day + 'T00:00:00Z').getTime() / 86_400_000);
  return ESSAY_PROMPTS[n % ESSAY_PROMPTS.length];
}

interface SessionRow {
  id: number;
  creator_id: number;
  invitee_id: number | null;
  title: string;
  place: string;
  starts_at: string;
  duration_min: number;
  status: string;
}

function endOf(s: SessionRow): number {
  return new Date(s.starts_at).getTime() + s.duration_min * 60_000;
}

/** Sessions the user took part in that are already over count as study time. */
function completedSessions(db: DB, userId: number): SessionRow[] {
  const rows = db
    .prepare(
      `SELECT s.* FROM study_sessions s JOIN session_participants p ON p.session_id = s.id
       WHERE p.user_id = ? AND s.status = 'accepted'`,
    )
    .all(userId) as unknown as SessionRow[];
  return rows.filter((s) => endOf(s) <= Date.now());
}

export function statsFor(db: DB, userId: number) {
  const today = dayOf();
  const weekAgo = addDays(today, -6);
  const logs = db
    .prepare('SELECT l.*, u.name AS partner_name FROM study_logs l LEFT JOIN users u ON u.id = l.partner_id WHERE l.user_id = ?')
    .all(userId) as { title: string; place: string; minutes: number; day: string; partner_name: string | null }[];

  const sessions = completedSessions(db, userId).map((s) => {
    const otherId = db
      .prepare('SELECT user_id FROM session_participants WHERE session_id = ? AND user_id != ? LIMIT 1')
      .get(s.id, userId) as { user_id: number } | undefined;
    const other = otherId ? getUser(db, otherId.user_id) : undefined;
    return { title: s.title, place: s.place, minutes: s.duration_min, day: dayOf(new Date(s.starts_at)), partner_name: other?.name ?? null };
  });
  const all = [...logs, ...sessions];

  const minutes = all.reduce((t, l) => t + l.minutes, 0);
  const weekMinutes = all.filter((l) => l.day >= weekAgo).reduce((t, l) => t + l.minutes, 0);

  const partners = (db.prepare('SELECT COUNT(*) AS n FROM connections WHERE user_id = ?').get(userId) as { n: number }).n;
  const partnersWeek = (
    db.prepare("SELECT COUNT(*) AS n FROM connections WHERE user_id = ? AND created_at >= datetime('now', '-7 days')").get(userId) as {
      n: number;
    }
  ).n;

  const essayDays = new Set((db.prepare('SELECT day FROM essays WHERE user_id = ?').all(userId) as { day: string }[]).map((r) => r.day));
  let streak = 0;
  let cursor = essayDays.has(today) ? today : addDays(today, -1);
  while (essayDays.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const recent = all
    .sort((a, b) => (a.day < b.day ? 1 : -1))
    .slice(0, 5)
    .map((l) => ({
      title: l.title,
      place: l.place,
      minutes: l.minutes,
      day: l.day,
      partnerName: l.partner_name ? l.partner_name.split(' ')[0] : null,
    }));

  return {
    hours: Math.round(minutes / 60),
    hoursThisWeek: Math.round(weekMinutes / 60),
    partners,
    partnersThisWeek: partnersWeek,
    essays: essayDays.size,
    streak,
    recent,
  };
}

export function serializeSession(db: DB, s: SessionRow, viewerId: number) {
  const participants = (
    db.prepare('SELECT u.* FROM session_participants p JOIN users u ON u.id = p.user_id WHERE p.session_id = ? ORDER BY p.rowid').all(s.id) as unknown as UserRow[]
  ).map((u) => publicUser(db, u));
  const creator = getUser(db, s.creator_id);
  return {
    id: s.id,
    title: s.title,
    place: s.place,
    startsAt: s.starts_at,
    durationMin: s.duration_min,
    status: s.status,
    creator: creator ? publicUser(db, creator) : null,
    inviteeId: s.invitee_id,
    participants,
    joined: participants.some((p) => p.id === viewerId),
    canRespond: s.status === 'proposed' && s.invitee_id === viewerId,
  };
}

export function homeRouter(db: DB) {
  const r = Router();
  // Mounted at /api, so only guard our own prefixes (unknown paths fall through to 404).
  r.use(['/stats', '/essays', '/sessions'], requireAuth(db));

  r.get('/stats/me', (_req, res) => res.json(statsFor(db, uid(res))));

  r.get('/essays/today', (_req, res) => {
    const day = dayOf();
    const row = db.prepare('SELECT body, created_at FROM essays WHERE user_id = ? AND day = ?').get(uid(res), day) as
      | { body: string; created_at: string }
      | undefined;
    res.json({ day, prompt: promptFor(day), body: row?.body ?? null, savedAt: sqlToIso(row?.created_at), max: ESSAY_MAX });
  });

  r.get('/essays', (_req, res) => {
    const rows = db.prepare('SELECT day, prompt, body FROM essays WHERE user_id = ? ORDER BY day DESC LIMIT 30').all(uid(res));
    res.json({ essays: rows });
  });

  r.post('/essays', (req, res) => {
    const body = str(req.body?.body, ESSAY_MAX + 1);
    if (!body) throw new HttpError(400, 'Fikringizni yozing');
    if (body.length > ESSAY_MAX) throw new HttpError(400, `Maksimum ${ESSAY_MAX} belgi`);
    const day = dayOf();
    db.prepare(
      `INSERT INTO essays (user_id, prompt, body, day) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, day) DO UPDATE SET body = excluded.body, created_at = datetime('now')`,
    ).run(uid(res), promptFor(day), body, day);
    res.json({ day, prompt: promptFor(day), body, stats: statsFor(db, uid(res)) });
  });

  /** Today's accepted sessions involving me or my partners ("Bugungi seans"). */
  r.get('/sessions/today', (_req, res) => {
    const me = uid(res);
    const today = dayOf();
    const rows = db
      .prepare(
        `SELECT DISTINCT s.* FROM study_sessions s
         LEFT JOIN session_participants p ON p.session_id = s.id
         WHERE s.status = 'accepted' AND (
           p.user_id = ? OR s.creator_id = ? OR
           s.creator_id IN (SELECT partner_id FROM connections WHERE user_id = ?) OR
           p.user_id IN (SELECT partner_id FROM connections WHERE user_id = ?)
         )
         ORDER BY s.starts_at`,
      )
      .all(me, me, me, me) as unknown as SessionRow[];
    const sessions = rows
      .filter((s) => dayOf(new Date(s.starts_at)) === today && endOf(s) > Date.now())
      .map((s) => serializeSession(db, s, me));
    res.json({ sessions });
  });

  /** Propose a study session to a partner (shows up in chat + notifications). */
  r.post('/sessions', (req, res) => {
    const me = uid(res);
    const partnerId = idParam(req.body?.partnerId);
    const title = str(req.body?.title, 80);
    const place = str(req.body?.place, 80);
    const durationMin = Math.round(Number(req.body?.durationMin) || 60);
    const startsAt = new Date(String(req.body?.startsAt || ''));
    if (!getUser(db, partnerId) || partnerId === me) throw new HttpError(400, 'Sherik topilmadi');
    if (!title) throw new HttpError(400, 'Seans nomini kiriting');
    if (!place) throw new HttpError(400, 'Joyni kiriting');
    if (Number.isNaN(startsAt.getTime())) throw new HttpError(400, "Vaqt noto'g'ri");
    if (durationMin < 15 || durationMin > 600) throw new HttpError(400, "Davomiylik 15 daqiqadan 10 soatgacha bo'lsin");

    const session = tx(db, () => {
      const info = db
        .prepare('INSERT INTO study_sessions (creator_id, invitee_id, title, place, starts_at, duration_min) VALUES (?, ?, ?, ?, ?, ?)')
        .run(me, partnerId, title, place, startsAt.toISOString(), durationMin);
      const id = Number(info.lastInsertRowid);
      db.prepare('INSERT INTO session_participants (session_id, user_id) VALUES (?, ?)').run(id, me);
      db.prepare("INSERT INTO messages (sender_id, receiver_id, kind, session_id) VALUES (?, ?, 'session', ?)").run(me, partnerId, id);
      const myName = getUser(db, me)!.name.split(' ')[0];
      notify(db, { userId: partnerId, kind: 'session_invite', actorId: me, sessionId: id, title: `${myName} sizga taklif yubordi` });
      return db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(id) as unknown as SessionRow;
    });
    res.status(201).json({ session: serializeSession(db, session, me) });
  });

  r.post('/sessions/:id/respond', (req, res) => {
    const me = uid(res);
    const s = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(idParam(req.params.id)) as unknown as SessionRow | undefined;
    if (!s) throw new HttpError(404, 'Seans topilmadi');
    if (s.invitee_id !== me) throw new HttpError(403, 'Bu taklif sizga emas');
    if (s.status !== 'proposed') throw new HttpError(409, 'Bu taklifga allaqachon javob berilgan');
    const accept = !!req.body?.accept;
    tx(db, () => {
      db.prepare('UPDATE study_sessions SET status = ? WHERE id = ?').run(accept ? 'accepted' : 'declined', s.id);
      if (accept) db.prepare('INSERT OR IGNORE INTO session_participants (session_id, user_id) VALUES (?, ?)').run(s.id, me);
      db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE session_id = ? AND user_id = ?").run(s.id, me);
      const myName = getUser(db, me)!.name.split(' ')[0];
      notify(db, {
        userId: s.creator_id,
        kind: accept ? 'session_accepted' : 'session_declined',
        actorId: me,
        sessionId: s.id,
        title: accept ? `${myName} taklifingizni qabul qildi` : `${myName} taklifingizni rad etdi`,
        body: s.title,
      });
    });
    const updated = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(s.id) as unknown as SessionRow;
    res.json({ session: serializeSession(db, updated, me) });
  });

  r.post('/sessions/:id/join', (req, res) => {
    const me = uid(res);
    const s = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(idParam(req.params.id)) as unknown as SessionRow | undefined;
    if (!s || s.status !== 'accepted') throw new HttpError(404, 'Seans topilmadi');
    if (s.creator_id !== me && !areConnected(db, me, s.creator_id)) throw new HttpError(403, "Faqat sheriklar seansiga qo'shilish mumkin");
    if (endOf(s) <= Date.now()) throw new HttpError(409, 'Seans allaqachon tugagan');
    const info = db.prepare('INSERT OR IGNORE INTO session_participants (session_id, user_id) VALUES (?, ?)').run(s.id, me);
    if (Number(info.changes) > 0 && s.creator_id !== me) {
      const myName = getUser(db, me)!.name.split(' ')[0];
      notify(db, { userId: s.creator_id, kind: 'session_joined', actorId: me, sessionId: s.id, title: `${myName} seansingizga qo'shildi`, body: s.title });
    }
    res.json({ session: serializeSession(db, s, me) });
  });

  r.delete('/sessions/:id/join', (req, res) => {
    const me = uid(res);
    const s = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(idParam(req.params.id)) as unknown as SessionRow | undefined;
    if (!s) throw new HttpError(404, 'Seans topilmadi');
    if (s.creator_id === me) throw new HttpError(400, "Yaratuvchi seansni tark eta olmaydi");
    db.prepare('DELETE FROM session_participants WHERE session_id = ? AND user_id = ?').run(s.id, me);
    res.json({ session: serializeSession(db, s, me) });
  });

  return r;
}

export type { SessionRow };
