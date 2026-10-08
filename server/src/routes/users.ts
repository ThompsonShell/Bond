import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { requireAuth, uid } from '../auth.js';
import { tx, type DB } from '../db.js';
import { matchScore } from '../matching.js';
import { statsFor } from './home.js';
import {
  areConnected,
  connect,
  distanceKm,
  getUser,
  h,
  HttpError,
  idParam,
  notify,
  profileUser,
  publicUser,
  selfUser,
  str,
  type UserRow,
} from '../util.js';
import { normalizeUsername, USERNAME_RE } from './auth.js';

export const INTEREST_OPTIONS = [
  'IELTS',
  'English',
  'SAT',
  'Programming',
  'Speaking',
  'Writing',
  'Listening',
  'Reading',
  'Math',
  'Physics',
  'Design',
  'Olimpiada',
];
const PLACE_TYPES = ['cowork', 'library', 'cafe', 'online'];
const SCHEDULES = ['morning', 'day', 'evening'];

export function usersRouter(db: DB, uploadDir: string) {
  const r = Router();
  r.use(requireAuth(db));

  r.get('/interests', (_req, res) => res.json({ options: INTEREST_OPTIONS }));

  r.patch(
    '/me',
    h((req, res) => {
      const me = uid(res);
      const b = req.body ?? {};
      const sets: string[] = [];
      const vals: (string | number | null)[] = [];
      const set = (col: string, v: string | number | null) => {
        sets.push(`${col} = ?`);
        vals.push(v);
      };

      if (b.name !== undefined) {
        const name = str(b.name, 80);
        if (name.length < 2) throw new HttpError(400, 'Ismingizni kiriting');
        set('name', name);
      }
      if (b.username !== undefined) {
        const u = normalizeUsername(b.username);
        if (!USERNAME_RE.test(u)) throw new HttpError(400, "Foydalanuvchi nomi: 3–24 ta kichik harf, raqam yoki _");
        if (db.prepare('SELECT 1 FROM users WHERE username = ? AND id != ?').get(u, me)) throw new HttpError(409, 'Bu foydalanuvchi nomi band');
        set('username', u);
      }
      if (b.bio !== undefined) set('bio', str(b.bio, 600));
      if (b.city !== undefined) set('city', str(b.city, 60));
      if (b.subject !== undefined) set('subject', str(b.subject, 60));
      if (b.place !== undefined) set('place', str(b.place, 80));
      if (b.placeType !== undefined) {
        if (!PLACE_TYPES.includes(b.placeType)) throw new HttpError(400, "Joy turi noto'g'ri");
        set('place_type', b.placeType);
      }
      if (b.schedule !== undefined) {
        if (!SCHEDULES.includes(b.schedule)) throw new HttpError(400, "Jadval noto'g'ri");
        set('schedule', b.schedule);
      }
      if (b.theme !== undefined) {
        if (!['green', 'light'].includes(b.theme)) throw new HttpError(400, "Rejim noto'g'ri");
        set('theme', b.theme);
      }
      if (b.language !== undefined) {
        if (!['uz', 'en', 'ru'].includes(b.language)) throw new HttpError(400, "Til noto'g'ri");
        set('language', b.language);
      }
      for (const [key, col] of [
        ['isStudying', 'is_studying'],
        ['shareLocation', 'share_location'],
        ['hidden', 'hidden'],
        ['onboarded', 'onboarded'],
      ] as const) {
        if (b[key] !== undefined) set(col, b[key] ? 1 : 0);
      }
      if (b.lat !== undefined || b.lng !== undefined) {
        const lat = Number(b.lat);
        const lng = Number(b.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          throw new HttpError(400, "Joylashuv noto'g'ri");
        }
        set('lat', lat);
        set('lng', lng);
      }

      let interests: string[] | null = null;
      if (b.interests !== undefined) {
        if (!Array.isArray(b.interests)) throw new HttpError(400, "Qiziqishlar ro'yxat bo'lishi kerak");
        interests = [...new Set(b.interests.map((t: unknown) => str(t, 30)).filter(Boolean))].slice(0, 12) as string[];
      }

      tx(db, () => {
        if (sets.length) db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals, me);
        if (interests) {
          db.prepare('DELETE FROM interests WHERE user_id = ?').run(me);
          const ins = db.prepare('INSERT INTO interests (user_id, tag) VALUES (?, ?)');
          for (const t of interests) ins.run(me, t);
        }
      });
      res.json({ user: selfUser(db, getUser(db, me)!) });
    }),
  );

  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadDir,
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.mp4';
        cb(null, `video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('video/')),
  });

  r.post(
    '/me/video',
    upload.single('video'),
    h((req, res) => {
      if (!req.file) throw new HttpError(400, 'Video fayl yuklang (maks. 50 MB)');
      const me = uid(res);
      const old = getUser(db, me)?.video_url;
      if (old?.startsWith('/uploads/')) fs.rm(path.join(uploadDir, path.basename(old)), { force: true }, () => {});
      db.prepare('UPDATE users SET video_url = ? WHERE id = ?').run(`/uploads/${req.file.filename}`, me);
      res.json({ user: selfUser(db, getUser(db, me)!) });
    }),
  );

  r.delete('/me/video', (_req, res) => {
    const me = uid(res);
    const old = getUser(db, me)?.video_url;
    if (old?.startsWith('/uploads/')) fs.rm(path.join(uploadDir, path.basename(old)), { force: true }, () => {});
    db.prepare('UPDATE users SET video_url = NULL WHERE id = ?').run(me);
    res.json({ user: selfUser(db, getUser(db, me)!) });
  });

  /** Partners studying right now, nearest first ("Hozir o'qiyotganlar"). */
  r.get('/studying-now', (_req, res) => {
    const me = getUser(db, uid(res))!;
    const rows = db
      .prepare('SELECT * FROM users WHERE id != ? AND hidden = 0 AND is_studying = 1')
      .all(me.id) as unknown as UserRow[];
    const out = rows
      .map((u) => ({ ...publicUser(db, u), distanceKm: dist(me, u), connected: areConnected(db, me.id, u.id) }))
      .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    res.json({ users: out });
  });

  /** People nearby for the map, with offsets (km) relative to the viewer. */
  r.get('/nearby', (req, res) => {
    const me = getUser(db, uid(res))!;
    const filter = String(req.query.filter || 'all');
    const q = str(req.query.q, 60).toLowerCase();
    const radius = Math.min(Number(req.query.radius) || 15, 100);
    if (me.lat == null || me.lng == null) return res.json({ users: [], center: null });

    const rows = db
      .prepare('SELECT * FROM users WHERE id != ? AND hidden = 0 AND share_location = 1 AND lat IS NOT NULL AND lng IS NOT NULL')
      .all(me.id) as unknown as UserRow[];
    const out = rows
      .filter((u) => filter === 'all' || u.place_type === filter)
      .filter((u) => !q || `${u.place} ${u.name} ${u.subject}`.toLowerCase().includes(q))
      .map((u) => {
        const d = distanceKm(me.lat!, me.lng!, u.lat!, u.lng!);
        const dx = distanceKm(me.lat!, me.lng!, me.lat!, u.lng!) * Math.sign(u.lng! - me.lng!);
        const dy = distanceKm(me.lat!, me.lng!, u.lat!, me.lng!) * Math.sign(u.lat! - me.lat!);
        return { ...publicUser(db, u), distanceKm: round1(d), dx, dy, connected: areConnected(db, me.id, u.id) };
      })
      .filter((u) => u.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ users: out, center: { lat: me.lat, lng: me.lng } });
  });

  /** AI matching: ranked partners with a compatibility score. */
  r.get('/matches', (_req, res) => {
    const me = getUser(db, uid(res))!;
    const rows = db.prepare('SELECT * FROM users WHERE id != ? AND hidden = 0').all(me.id) as unknown as UserRow[];
    const out = rows
      .map((u) => {
        const m = matchScore(db, me, u);
        return { ...publicUser(db, u), bio: u.bio, score: m.score, reasons: m.reasons, connected: areConnected(db, me.id, u.id) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    res.json({ users: out });
  });

  r.get('/:id', (req, res) => {
    const me = getUser(db, uid(res))!;
    const u = getUser(db, idParam(req.params.id));
    if (!u || (u.hidden && u.id !== me.id)) throw new HttpError(404, 'Foydalanuvchi topilmadi');
    res.json({
      user: { ...profileUser(db, u), distanceKm: dist(me, u), connected: areConnected(db, me.id, u.id) },
      stats: statsFor(db, u.id),
      match: u.id === me.id ? null : matchScore(db, me, u),
    });
  });

  /** "Bog'lanish" — become study partners. */
  r.post('/:id/connect', (req, res) => {
    const me = uid(res);
    const other = idParam(req.params.id);
    if (other === me) throw new HttpError(400, "O'zingiz bilan bog'lana olmaysiz");
    const u = getUser(db, other);
    if (!u) throw new HttpError(404, 'Foydalanuvchi topilmadi');
    const created = tx(db, () => {
      const isNew = connect(db, me, other);
      if (isNew) {
        const myName = getUser(db, me)!.name.split(' ')[0];
        notify(db, { userId: other, kind: 'new_match', actorId: me, title: `Yangi mos sherik — ${myName}`, body: "Siz bilan bog'landi" });
      }
      return isNew;
    });
    res.status(created ? 201 : 200).json({ connected: true });
  });

  return r;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function dist(me: UserRow, u: UserRow): number | null {
  if (me.lat == null || me.lng == null || u.lat == null || u.lng == null || !u.share_location) return null;
  return round1(distanceKm(me.lat, me.lng, u.lat, u.lng));
}
