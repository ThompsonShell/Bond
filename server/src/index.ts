import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDb } from './db.js';
import { seedIfEmpty } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const db = openDb(process.env.DB_PATH || path.join(root, 'bondi.db'));
await seedIfEmpty(db);

const app = createApp(db, {
  uploadDir: process.env.UPLOAD_DIR || path.join(root, 'uploads'),
  staticDir: path.resolve(root, '../client/dist'),
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Bondi API → http://localhost:${port}`);
});
