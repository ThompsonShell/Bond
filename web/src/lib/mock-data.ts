/**
 * Sample data (mock layer).
 *
 * Everything the UI shows comes from here through `lib/server/store.ts` and the
 * `/api/*` route handlers. When the real backend is ready, replace the store
 * implementation — pages and components do not import this file directly.
 */
import type { Conversation, CurrentUser, EventItem, NotificationItem, NotificationSettings, Person, Post } from './types';

export const mockUser: CurrentUser = {
  id: 'me',
  name: 'Aziza',
  email: 'aziza@student.uz',
  initials: 'AK',
  university: 'INHA',
  topics: ['AI', 'Python'],
  studyTimes: [],
};

export const mockPeople: Person[] = [
  {
    id: 'dy',
    name: 'Dilnoza Yusupova',
    initials: 'DY',
    tags: ['AI', 'Python'],
    extra: '3 umumiy do’st',
    university: 'WIUT',
    matchPercent: 94,
    reasons: ['AI va Python o’rganyapti', '3 ta umumiy do’stingiz bor'],
    matchNote: 'AI, Python · 3 umumiy do’st',
    requested: false,
    invited: false,
  },
  {
    id: 'ba',
    name: 'Bekzod Aliyev',
    initials: 'BA',
    tags: ['Mobile', 'Flutter'],
    extra: 'INHA',
    university: 'INHA',
    matchPercent: 88,
    reasons: ['Mobile va Flutter bilan shug’ullanadi', 'INHA talabasi'],
    matchNote: 'Mobile, Flutter · INHA',
    requested: false,
    invited: false,
  },
  {
    id: 'ns',
    name: 'Nilufar Saidova',
    initials: 'NS',
    tags: ['UI/UX'],
    extra: 'Hackathon ishtirokchisi',
    university: 'TATU',
    matchPercent: 82,
    reasons: ['UI/UX yo’nalishida', 'Hackathon ishtirokchisi'],
    matchNote: 'UI/UX · Hackathon ishtirokchisi',
    requested: false,
    invited: false,
  },
  {
    id: 'jt',
    name: 'Jasur Tursunov',
    initials: 'JT',
    tags: ['Web Dev'],
    extra: 'INHA',
    university: 'INHA',
    matchPercent: 0,
    reasons: ['Web Dev yo’nalishida', 'INHA talabasi'],
    matchNote: 'Web Dev · INHA',
    requested: false,
    invited: false,
  },
  {
    id: 'mr',
    name: 'Madina Rahimova',
    initials: 'MR',
    tags: ['AI'],
    extra: 'WIUT',
    university: 'WIUT',
    matchPercent: 0,
    reasons: ['AI yo’nalishida', 'WIUT talabasi'],
    matchNote: 'AI · WIUT',
    requested: false,
    invited: false,
  },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'jt',
    tag: 'Web Dev',
    university: 'INHA',
    timeAgo: '2 soat oldin',
    text: 'Hackathon uchun jamoa yig’yapman — frontend va dizayner kerak. 48 soat, mukofot fondi bor. Qiziqqanlar yozing!',
    likes: 24,
    liked: false,
    comments: 8,
    feed: 'Do’stlar',
  },
  {
    id: 'p2',
    authorId: 'mr',
    tag: 'AI',
    university: 'WIUT',
    timeAgo: '5 soat oldin',
    text: 'Keyingi shanba ML bo’yicha ochiq meetup. Boshlovchilar ham kelaversin — noutbukingizni olib keling.',
    likes: 0,
    liked: false,
    comments: 0,
    feed: 'Tadbirlar',
  },
];

export const mockEvents: EventItem[] = [
  { id: 'spn', month: 'okt', day: '08', title: 'Startup Pitch Night', place: 'Ground Zero', dateLabel: '8-oktabr', tags: [], going: false },
  { id: 'ml', month: 'okt', day: '12', title: 'ML Meetup', place: 'IT Park', dateLabel: '12-oktabr', tags: ['AI'], going: false },
  { id: 'dj', month: 'okt', day: '19', title: 'Design Jam', place: 'TATU, 3-bino', dateLabel: '19-oktabr', tags: ['UI/UX'], going: false },
];

export const mockConversations: Conversation[] = [
  {
    personId: 'dy',
    sub: 'AI, Python',
    unread: 0,
    messages: [
      { id: 'dy1', kind: 'text', from: 'them', text: 'Salom! 18:00 menga to’g’ri keladi.' },
      { id: 'dy2', kind: 'session', title: 'Dars seansi', when: 'Bugun, 18:00', status: 'Tasdiqlandi' },
      { id: 'dy3', kind: 'text', from: 'me', text: 'Zo’r. Python’dan boshlaymizmi?' },
    ],
  },
  {
    personId: 'ba',
    sub: 'Mobile, Flutter · INHA',
    unread: 2,
    messages: [
      { id: 'ba1', kind: 'text', from: 'them', text: 'Salom, Aziza!' },
      { id: 'ba2', kind: 'text', from: 'them', text: 'Flutter bo’yicha birga dars qilamizmi?' },
    ],
  },
  {
    personId: 'ns',
    sub: 'UI/UX · Hackathon ishtirokchisi',
    unread: 1,
    messages: [{ id: 'ns1', kind: 'text', from: 'them', text: 'Salom! Hackathonga jamoa qidiryapsizmi?' }],
  },
];

export const mockNotifications: NotificationItem[] = [
  { id: 'm1', kind: 'match', text: 'Dilnoza Yusupova sizga 94% mos keldi', meta: 'AI Matching', read: false },
  { id: 'p1', kind: 'post', text: 'Jasur Tursunov hackathon uchun jamoa yig’yapti', meta: 'Lenta · 2 soat oldin', read: false },
  { id: 'e1', kind: 'event', text: 'Startup Pitch Night: 8-oktabr, Ground Zero', meta: 'Tadbirlar', read: true },
  { id: 'e2', kind: 'event', text: 'ML Meetup: 12-oktabr, IT Park', meta: 'Tadbirlar', read: true },
];

/** Journal: 6 days in a row before today. */
export const mockJournal = { streakBeforeToday: 6 };

export const mockNotificationSettings: NotificationSettings = { match: true, chat: true, event: false };
