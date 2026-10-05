import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { DB } from './db.js';
import { HttpError } from './util.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bondi-dev-secret';
const TOKEN_TTL = '30d';

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function uid(res: Response): number {
  return res.locals.userId as number;
}

const lastTouch = new Map<number, number>();

export function requireAuth(db: DB) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return next(new HttpError(401, 'Avval tizimga kiring'));
    let userId: number;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      userId = Number(payload.sub);
    } catch {
      return next(new HttpError(401, 'Sessiya muddati tugagan, qayta kiring'));
    }
    if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) {
      return next(new HttpError(401, 'Foydalanuvchi topilmadi'));
    }
    res.locals.userId = userId;
    // Presence: refresh last_active at most once a minute per user.
    const now = Date.now();
    if ((lastTouch.get(userId) ?? 0) < now - 60_000) {
      lastTouch.set(userId, now);
      db.prepare("UPDATE users SET last_active = datetime('now') WHERE id = ?").run(userId);
    }
    next();
  };
}
