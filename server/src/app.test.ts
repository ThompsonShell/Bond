import assert from 'node:assert/strict';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createApp } from './app.js';
import { openDb } from './db.js';
import { DEMO_EMAIL, DEMO_PASSWORD, seed } from './seed.js';

let base = '';
let close: () => void = () => {};
let token = '';

async function api(method: string, url: string, body?: unknown, auth = token) {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as any };
}

before(async () => {
  const db = openDb(':memory:');
  await seed(db);
  const app = createApp(db, { uploadDir: fs.mkdtempSync(path.join(os.tmpdir(), 'bondi-')) });
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  close = () => server.close();
});

after(() => close());

describe('auth', () => {
  it('rejects bad credentials and accepts the demo user', async () => {
    assert.equal((await api('POST', '/auth/login', { email: DEMO_EMAIL, password: 'nope' }, '')).status, 401);
    const ok = await api('POST', '/auth/login', { email: DEMO_EMAIL, password: DEMO_PASSWORD }, '');
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.username, 'aziz_study');
    token = ok.body.token;
  });

  it('registers a new user and validates input', async () => {
    assert.equal((await api('POST', '/auth/register', { name: 'A', email: 'x', password: '1', username: '!' }, '')).status, 400);
    const avail = await api('GET', '/auth/username-available?u=aziz_study', undefined, '');
    assert.equal(avail.body.available, false);
    const r = await api('POST', '/auth/register', { name: 'Test User', email: 'test@bondi.uz', password: 'password1', username: '@test_user' }, '');
    assert.equal(r.status, 201);
    assert.equal(r.body.user.username, 'test_user');
    assert.equal(r.body.user.onboarded, false);
    const dup = await api('POST', '/auth/register', { name: 'Test User', email: 'TEST@bondi.uz', password: 'password1', username: 'other' }, '');
    assert.equal(dup.status, 409);
  });

  it('requires a token for protected routes', async () => {
    assert.equal((await api('GET', '/stats/me', undefined, '')).status, 401);
  });
});

describe('home', () => {
  it('returns stats matching the seeded design numbers', async () => {
    const { body } = await api('GET', '/stats/me');
    assert.equal(body.hours, 48);
    assert.equal(body.partners, 12);
    assert.equal(body.partnersThisWeek, 3);
    assert.equal(body.essays, 8);
    assert.equal(body.streak, 5);
  });

  it('saves today\'s essay and extends the streak', async () => {
    assert.equal((await api('POST', '/essays', { body: 'x'.repeat(501) })).status, 400);
    const r = await api('POST', '/essays', { body: "Bugun yangi so'z o'rgandim" });
    assert.equal(r.status, 200);
    assert.equal(r.body.stats.streak, 6);
    const today = await api('GET', '/essays/today');
    assert.equal(today.body.body, "Bugun yangi so'z o'rgandim");
  });

  it('lists people studying now and nearby', async () => {
    const now = await api('GET', '/users/studying-now');
    assert.ok(now.body.users.length >= 4);
    const near = await api('GET', '/users/nearby?filter=cowork');
    assert.ok(near.body.users.every((u: any) => u.placeType === 'cowork'));
    assert.ok(near.body.users.some((u: any) => u.name === 'Sardor Karimov'));
  });

  it('ranks matches by score', async () => {
    const { body } = await api('GET', '/users/matches');
    const scores = body.users.map((u: any) => u.score);
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
    assert.equal(body.users[0].name, 'Dilnoza Rahimova');
  });
});

describe('chat & sessions', () => {
  it('lists conversations with unread counts and marks them read', async () => {
    const list = await api('GET', '/chat/conversations');
    const sardor = list.body.conversations[0];
    assert.equal(sardor.user.name, 'Sardor Karimov');
    assert.equal(sardor.unread, 2);
    const msgs = await api('GET', `/chat/conversations/${sardor.user.id}/messages`);
    assert.equal(msgs.body.messages.at(-1).kind, 'session');
    const again = await api('GET', '/chat/conversations?filter=unread');
    assert.equal(again.body.conversations.length, 0);
  });

  it('sends a message and accepts a session invite', async () => {
    const list = await api('GET', '/chat/conversations');
    const sardorId = list.body.conversations[0].user.id;
    const sent = await api('POST', `/chat/conversations/${sardorId}/messages`, { body: "Yaxshi, co-workingda ko'rishamiz!" });
    assert.equal(sent.status, 201);
    assert.equal(sent.body.message.mine, true);

    const notes = await api('GET', '/notifications');
    const invite = notes.body.notifications.find((n: any) => n.kind === 'session_invite');
    assert.ok(invite.session.canRespond);
    const r = await api('POST', `/sessions/${invite.session.id}/respond`, { accept: true });
    assert.equal(r.body.session.status, 'accepted');
    assert.equal(r.body.session.joined, true);
    assert.equal((await api('POST', `/sessions/${invite.session.id}/respond`, { accept: false })).status, 409);
  });

  it("joins a partner's session today", async () => {
    const today = await api('GET', '/sessions/today');
    const s = today.body.sessions.find((x: any) => !x.joined);
    if (!s) return; // after 17:00 Tashkent time the seeded session is over
    const r = await api('POST', `/sessions/${s.id}/join`);
    assert.equal(r.body.session.joined, true);
  });

  it('connects with a match and notifies them', async () => {
    const { body } = await api('GET', '/users/matches');
    const target = body.users.find((u: any) => !u.connected);
    const r = await api('POST', `/users/${target.id}/connect`);
    assert.equal(r.status, 201);
    const profile = await api('GET', `/users/${target.id}`);
    assert.equal(profile.body.user.connected, true);
  });
});

describe('profile', () => {
  it('updates profile fields and interests', async () => {
    const r = await api('PATCH', '/users/me', { bio: 'Yangi bio', interests: ['IELTS', 'SAT'], theme: 'light', hidden: false });
    assert.equal(r.status, 200);
    assert.equal(r.body.user.bio, 'Yangi bio');
    assert.deepEqual(r.body.user.interests, ['IELTS', 'SAT']);
    assert.equal(r.body.user.theme, 'light');
    assert.equal((await api('PATCH', '/users/me', { theme: 'pink' })).status, 400);
  });
});
