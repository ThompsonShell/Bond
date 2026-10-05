import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type { DB } from './db.js';
import { authRouter } from './routes/auth.js';
import { chatRouter, notificationsRouter } from './routes/chat.js';
import { homeRouter } from './routes/home.js';
import { usersRouter } from './routes/users.js';
import { HttpError } from './util.js';

export interface AppOptions {
  uploadDir: string;
  /** Built frontend (client/dist) to serve in production, if present. */
  staticDir?: string;
}

export function createApp(db: DB, opts: AppOptions) {
  fs.mkdirSync(opts.uploadDir, { recursive: true });
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter(db));
  app.use('/api/users', usersRouter(db, opts.uploadDir));
  app.use('/api/chat', chatRouter(db));
  app.use('/api/notifications', notificationsRouter(db));
  app.use('/api', homeRouter(db));
  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Topilmadi')));

  app.use('/uploads', express.static(opts.uploadDir, { maxAge: '7d' }));

  if (opts.staticDir && fs.existsSync(path.join(opts.staticDir, 'index.html'))) {
    const staticDir = opts.staticDir;
    app.use(express.static(staticDir, { index: false }));
    // SPA fallback for client-side routes.
    app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
  }

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    const e = err as { code?: string; type?: string; status?: number };
    if (e?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Fayl juda katta (maks. 50 MB)' });
    if (e?.type === 'entity.parse.failed') return res.status(400).json({ error: "So'rov formati noto'g'ri" });
    console.error(err);
    res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
  });

  return app;
}
