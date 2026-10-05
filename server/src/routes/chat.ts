import { Router } from 'express';
import { requireAuth, uid } from '../auth.js';
import type { DB } from '../db.js';
import { getUser, HttpError, idParam, publicUser, sqlToIso, str, type UserRow } from '../util.js';
import { serializeSession, type SessionRow } from './home.js';

interface MessageRow {
  id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  kind: string;
  session_id: number | null;
  read_at: string | null;
  created_at: string;
}

function serializeMessage(db: DB, m: MessageRow, viewerId: number) {
  let session = null;
  if (m.session_id) {
    const s = db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(m.session_id) as unknown as SessionRow | undefined;
    if (s) session = serializeSession(db, s, viewerId);
  }
  return {
    id: m.id,
    senderId: m.sender_id,
    mine: m.sender_id === viewerId,
    body: m.body,
    kind: m.kind,
    session,
    createdAt: sqlToIso(m.created_at),
    readAt: sqlToIso(m.read_at),
  };
}

export function chatRouter(db: DB) {
  const r = Router();
  r.use(requireAuth(db));

  r.get('/unread', (_req, res) => {
    const me = uid(res);
    const messages = (db.prepare('SELECT COUNT(*) AS n FROM messages WHERE receiver_id = ? AND read_at IS NULL').get(me) as { n: number }).n;
    const notifications = (db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL').get(me) as { n: number }).n;
    res.json({ messages, notifications });
  });

  r.get('/conversations', (req, res) => {
    const me = uid(res);
    const filter = String(req.query.filter || 'all');
    const q = str(req.query.q, 60).toLowerCase();
    const rows = db
      .prepare(
        `SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id, MAX(id) AS last_id
         FROM messages WHERE sender_id = ? OR receiver_id = ?
         GROUP BY other_id ORDER BY last_id DESC`,
      )
      .all(me, me, me) as { other_id: number; last_id: number }[];

    const conversations = rows
      .map((row) => {
        const other = getUser(db, row.other_id);
        if (!other) return null;
        const last = db.prepare('SELECT * FROM messages WHERE id = ?').get(row.last_id) as unknown as MessageRow;
        const unread = (
          db.prepare('SELECT COUNT(*) AS n FROM messages WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL').get(other.id, me) as {
            n: number;
          }
        ).n;
        return {
          user: publicUser(db, other),
          lastMessage: serializeMessage(db, last, me),
          unread,
        };
      })
      .filter((c): c is NonNullable<typeof c> => !!c)
      .filter((c) => filter !== 'unread' || c.unread > 0)
      .filter((c) => !q || c.user.name.toLowerCase().includes(q) || c.lastMessage.body.toLowerCase().includes(q));
    res.json({ conversations });
  });

  r.get('/conversations/:userId/messages', (req, res) => {
    const me = uid(res);
    const other = getUser(db, idParam(req.params.userId));
    if (!other) throw new HttpError(404, 'Foydalanuvchi topilmadi');
    const after = Number(req.query.after) || 0;
    const rows = db
      .prepare(
        `SELECT * FROM messages
         WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND id > ?
         ORDER BY id LIMIT 500`,
      )
      .all(me, other.id, other.id, me, after) as unknown as MessageRow[];
    db.prepare("UPDATE messages SET read_at = datetime('now') WHERE sender_id = ? AND receiver_id = ? AND read_at IS NULL").run(other.id, me);
    res.json({ user: publicUser(db, other as UserRow), messages: rows.map((m) => serializeMessage(db, m, me)) });
  });

  r.post('/conversations/:userId/messages', (req, res) => {
    const me = uid(res);
    const otherId = idParam(req.params.userId);
    if (otherId === me) throw new HttpError(400, "O'zingizga xabar yubora olmaysiz");
    if (!getUser(db, otherId)) throw new HttpError(404, 'Foydalanuvchi topilmadi');
    const body = str(req.body?.body, 2000);
    if (!body) throw new HttpError(400, 'Xabar bo\'sh');
    const info = db.prepare('INSERT INTO messages (sender_id, receiver_id, body) VALUES (?, ?, ?)').run(me, otherId, body);
    const m = db.prepare('SELECT * FROM messages WHERE id = ?').get(Number(info.lastInsertRowid)) as unknown as MessageRow;
    res.status(201).json({ message: serializeMessage(db, m, me) });
  });

  return r;
}

export function notificationsRouter(db: DB) {
  const r = Router();
  r.use(requireAuth(db));

  r.get('/', (_req, res) => {
    const me = uid(res);
    const rows = db
      .prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50')
      .all(me) as {
      id: number;
      kind: string;
      actor_id: number | null;
      session_id: number | null;
      title: string;
      body: string;
      read_at: string | null;
      created_at: string;
    }[];
    const notifications = rows.map((n) => {
      const actor = n.actor_id ? getUser(db, n.actor_id) : undefined;
      const s = n.session_id
        ? (db.prepare('SELECT * FROM study_sessions WHERE id = ?').get(n.session_id) as unknown as SessionRow | undefined)
        : undefined;
      return {
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        actor: actor ? publicUser(db, actor) : null,
        session: s ? serializeSession(db, s, me) : null,
        read: !!n.read_at,
        createdAt: sqlToIso(n.created_at),
      };
    });
    res.json({ notifications });
  });

  r.post('/read-all', (_req, res) => {
    db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL").run(uid(res));
    res.json({ ok: true });
  });

  r.post('/:id/read', (req, res) => {
    db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?").run(idParam(req.params.id), uid(res));
    res.json({ ok: true });
  });

  return r;
}
