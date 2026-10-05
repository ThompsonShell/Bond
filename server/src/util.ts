import type { NextFunction, Request, Response } from 'express';
import type { DB } from './db.js';

export const APP_TZ = process.env.APP_TZ || 'Asia/Tashkent';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wraps async handlers so thrown errors reach the error middleware. */
export const h =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/** YYYY-MM-DD in the app timezone. */
export function dayOf(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function addDays(day: string, n: number): string {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** SQLite datetime('now') strings are UTC without a zone marker. */
export function sqlToIso(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.includes('T') ? s : s.replace(' ', 'T') + 'Z';
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  username: string;
  password_hash: string;
  bio: string;
  city: string;
  avatar_color: string;
  video_url: string | null;
  subject: string;
  place: string;
  place_type: string;
  schedule: string;
  lat: number | null;
  lng: number | null;
  is_studying: number;
  share_location: number;
  hidden: number;
  theme: string;
  language: string;
  onboarded: number;
  last_active: string | null;
  created_at: string;
}

export const ONLINE_WINDOW_MS = 10 * 60 * 1000;

export function getUser(db: DB, id: number): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
}

export function interestsOf(db: DB, id: number): string[] {
  return (db.prepare('SELECT tag FROM interests WHERE user_id = ? ORDER BY rowid').all(id) as { tag: string }[]).map((r) => r.tag);
}

export function isOnline(u: Pick<UserRow, 'last_active' | 'is_studying'>): boolean {
  if (u.is_studying) return true;
  const iso = sqlToIso(u.last_active);
  return !!iso && Date.now() - new Date(iso).getTime() < ONLINE_WINDOW_MS;
}

/** Public card shape shared by lists (home, map, matching, chat). */
export function publicUser(db: DB, u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    city: u.city,
    avatarColor: u.avatar_color,
    subject: u.subject,
    place: u.place,
    placeType: u.place_type,
    isStudying: !!u.is_studying,
    online: isOnline(u),
    interests: interestsOf(db, u.id),
  };
}

/** Full profile (another user's profile page). */
export function profileUser(db: DB, u: UserRow) {
  return {
    ...publicUser(db, u),
    bio: u.bio,
    schedule: u.schedule,
    videoUrl: u.video_url,
  };
}

/** The signed-in user, including private settings. */
export function selfUser(db: DB, u: UserRow) {
  return {
    ...profileUser(db, u),
    email: u.email,
    lat: u.lat,
    lng: u.lng,
    shareLocation: !!u.share_location,
    hidden: !!u.hidden,
    theme: u.theme,
    language: u.language,
    onboarded: !!u.onboarded,
  };
}

export function areConnected(db: DB, a: number, b: number): boolean {
  return !!db.prepare('SELECT 1 FROM connections WHERE user_id = ? AND partner_id = ?').get(a, b);
}

/** Connections are stored in both directions so lookups stay one-sided. */
export function connect(db: DB, a: number, b: number): boolean {
  const r = db.prepare('INSERT OR IGNORE INTO connections (user_id, partner_id) VALUES (?, ?)').run(a, b);
  db.prepare('INSERT OR IGNORE INTO connections (user_id, partner_id) VALUES (?, ?)').run(b, a);
  return Number(r.changes) > 0;
}

export function notify(
  db: DB,
  n: { userId: number; kind: string; actorId?: number | null; sessionId?: number | null; title: string; body?: string },
) {
  db.prepare('INSERT INTO notifications (user_id, kind, actor_id, session_id, title, body) VALUES (?, ?, ?, ?, ?, ?)').run(
    n.userId,
    n.kind,
    n.actorId ?? null,
    n.sessionId ?? null,
    n.title,
    n.body ?? '',
  );
}

export function str(v: unknown, max = 500): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function idParam(v: unknown): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Noto'g'ri ID");
  return n;
}
