import { DatabaseSync } from 'node:sqlite';

export type DB = DatabaseSync;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT 'Toshkent',
  avatar_color  TEXT NOT NULL DEFAULT 'green',
  video_url     TEXT,
  subject       TEXT NOT NULL DEFAULT '',
  place         TEXT NOT NULL DEFAULT '',
  place_type    TEXT NOT NULL DEFAULT 'online',
  schedule      TEXT NOT NULL DEFAULT 'morning',
  lat           REAL,
  lng           REAL,
  is_studying   INTEGER NOT NULL DEFAULT 0,
  share_location INTEGER NOT NULL DEFAULT 1,
  hidden        INTEGER NOT NULL DEFAULT 0,
  theme         TEXT NOT NULL DEFAULT 'green',
  language      TEXT NOT NULL DEFAULT 'uz',
  onboarded     INTEGER NOT NULL DEFAULT 0,
  last_active   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interests (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag     TEXT NOT NULL,
  PRIMARY KEY (user_id, tag)
);

CREATE TABLE IF NOT EXISTS connections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, partner_id)
);

CREATE TABLE IF NOT EXISTS study_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  creator_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  place        TEXT NOT NULL,
  starts_at    TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 60,
  status       TEXT NOT NULL DEFAULT 'proposed',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS session_participants (
  session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'text',
  session_id  INTEGER REFERENCES study_sessions(id) ON DELETE SET NULL,
  read_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, receiver_id, id);

CREATE TABLE IF NOT EXISTS essays (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt     TEXT NOT NULL,
  body       TEXT NOT NULL,
  day        TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, day)
);

CREATE TABLE IF NOT EXISTS study_logs (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title   TEXT NOT NULL,
  place   TEXT NOT NULL DEFAULT '',
  partner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  minutes INTEGER NOT NULL,
  day     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  actor_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  read_at    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function openDb(path: string): DB {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

export function resetDb(db: DB) {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS study_logs;
    DROP TABLE IF EXISTS essays;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS session_participants;
    DROP TABLE IF EXISTS study_sessions;
    DROP TABLE IF EXISTS connections;
    DROP TABLE IF EXISTS interests;
    DROP TABLE IF EXISTS users;
    PRAGMA foreign_keys = ON;
  `);
  db.exec(SCHEMA);
}

/** Runs fn inside a transaction (node:sqlite has no built-in helper). */
export function tx<T>(db: DB, fn: () => T): T {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
