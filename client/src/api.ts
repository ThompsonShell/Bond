export type AvatarColor = 'green' | 'orange' | 'blue' | 'amber' | 'rust' | 'rose' | 'indigo';
export type PlaceType = 'cowork' | 'library' | 'cafe' | 'online';
export type Schedule = 'morning' | 'day' | 'evening';
export type Theme = 'green' | 'light';

export interface PublicUser {
  id: number;
  name: string;
  username: string;
  city: string;
  avatarColor: AvatarColor;
  subject: string;
  place: string;
  placeType: PlaceType;
  isStudying: boolean;
  online: boolean;
  interests: string[];
}

export interface ProfileUser extends PublicUser {
  bio: string;
  schedule: Schedule;
  videoUrl: string | null;
}

export interface Me extends ProfileUser {
  email: string;
  lat: number | null;
  lng: number | null;
  shareLocation: boolean;
  hidden: boolean;
  theme: Theme;
  language: string;
  onboarded: boolean;
}

export interface Stats {
  hours: number;
  hoursThisWeek: number;
  partners: number;
  partnersThisWeek: number;
  essays: number;
  streak: number;
  recent: { title: string; place: string; minutes: number; day: string; partnerName: string | null }[];
}

export interface Session {
  id: number;
  title: string;
  place: string;
  startsAt: string;
  durationMin: number;
  status: 'proposed' | 'accepted' | 'declined';
  creator: PublicUser | null;
  inviteeId: number | null;
  participants: PublicUser[];
  joined: boolean;
  canRespond: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  mine: boolean;
  body: string;
  kind: 'text' | 'session';
  session: Session | null;
  createdAt: string;
  readAt: string | null;
}

export interface Conversation {
  user: PublicUser;
  lastMessage: Message;
  unread: number;
}

export interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string;
  actor: PublicUser | null;
  session: Session | null;
  read: boolean;
  createdAt: string;
}

export interface NearbyUser extends PublicUser {
  distanceKm: number;
  dx: number;
  dy: number;
  connected: boolean;
}

export interface MatchUser extends PublicUser {
  bio: string;
  score: number;
  reasons: string[];
  connected: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const TOKEN_KEY = 'bondi.token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch('/api' + path, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "Server bilan aloqa yo'q. Internetni tekshiring.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, (data as { error?: string }).error || 'Xatolik yuz berdi');
  }
  return data as T;
}

export const get = <T,>(path: string) => api<T>('GET', path);
export const post = <T,>(path: string, body?: unknown) => api<T>('POST', path, body ?? {});
export const patch = <T,>(path: string, body: unknown) => api<T>('PATCH', path, body);
export const del = <T,>(path: string) => api<T>('DELETE', path);
