import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { requireAuth, signToken, uid } from '../auth.js';
import type { DB } from '../db.js';
import { getUser, h, HttpError, selfUser, str, type UserRow } from '../util.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(v: unknown): string {
  return str(v, 40).replace(/^@/, '').toLowerCase();
}

const COLORS = ['green', 'orange', 'blue', 'amber', 'rust', 'rose', 'indigo'];

export function authRouter(db: DB) {
  const r = Router();

  r.get('/username-available', (req, res) => {
    const u = normalizeUsername(req.query.u);
    if (!USERNAME_RE.test(u)) return res.json({ available: false, reason: "3–24 ta kichik harf, raqam yoki _" });
    const taken = db.prepare('SELECT 1 FROM users WHERE username = ?').get(u);
    res.json({ available: !taken, reason: taken ? 'Bu nom band' : null });
  });

  r.post(
    '/register',
    h(async (req, res) => {
      const name = str(req.body?.name, 80);
      const email = str(req.body?.email, 120).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const username = normalizeUsername(req.body?.username);

      if (name.length < 2) throw new HttpError(400, 'Ismingizni kiriting');
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Email noto'g'ri");
      if (password.length < 8) throw new HttpError(400, "Parol kamida 8 belgidan iborat bo'lsin");
      if (!USERNAME_RE.test(username)) throw new HttpError(400, "Foydalanuvchi nomi: 3–24 ta kichik harf, raqam yoki _");
      if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, "Bu email allaqachon ro'yxatdan o'tgan");
      if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) throw new HttpError(409, 'Bu foydalanuvchi nomi band');

      const hash = await bcrypt.hash(password, 10);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const info = db
        .prepare('INSERT INTO users (name, email, username, password_hash, avatar_color) VALUES (?, ?, ?, ?, ?)')
        .run(name, email, username, hash, color);
      const user = getUser(db, Number(info.lastInsertRowid))!;
      res.status(201).json({ token: signToken(user.id), user: selfUser(db, user) });
    }),
  );

  r.post(
    '/login',
    h(async (req, res) => {
      const email = str(req.body?.email, 120).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, email.replace(/^@/, '')) as
        | UserRow
        | undefined;
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        throw new HttpError(401, "Email yoki parol noto'g'ri");
      }
      res.json({ token: signToken(user.id), user: selfUser(db, user) });
    }),
  );

  r.get('/me', requireAuth(db), (_req, res) => {
    res.json({ user: selfUser(db, getUser(db, uid(res))!) });
  });

  return r;
}
