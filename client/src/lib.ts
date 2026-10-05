import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, get, type PlaceType, type Schedule } from './api';

/** Fetches `path` and optionally re-polls it every `interval` ms. */
export function useFetch<T>(path: string | null, interval?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const current = useRef(path);
  current.current = path;

  const load = useCallback(
    async (silent = false) => {
      if (!path) return;
      if (!silent) setLoading(true);
      try {
        const d = await get<T>(path);
        if (current.current === path) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (current.current === path && !silent) setError(e instanceof ApiError ? e.message : 'Xatolik yuz berdi');
      } finally {
        if (current.current === path && !silent) setLoading(false);
      }
    },
    [path],
  );

  useEffect(() => {
    load();
    if (!interval) return;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, interval);
    return () => clearInterval(t);
  }, [load, interval]);

  return { data, setData, error, loading, reload: load };
}

export function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

export const useIsMobile = () => useMedia('(max-width: 860px)');

export function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Xatolik yuz berdi';
}

export function timeHM(iso: string): string {
  return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)} daq`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat`;
  if (diff < 172800) return 'Kecha';
  return `${Math.floor(diff / 86400)} kun`;
}

export function dayAgo(day: string): string {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const d = new Date(day + 'T12:00:00');
  const n = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (n <= 0) return 'Bugun';
  if (n === 1) return 'Kecha';
  return `${n} kun`;
}

export function sessionWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const label =
    d.toDateString() === now.toDateString()
      ? 'Bugun'
      : d.toDateString() === tomorrow.toDateString()
        ? 'Ertaga'
        : d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  return `${label} ${timeHM(iso)}`;
}

export function duration(min: number): string {
  if (min < 60) return `${min} daq`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} soat`;
}

export const firstName = (name: string) => name.split(' ')[0];

export const PLACE_LABELS: Record<PlaceType, string> = {
  cowork: 'Co-work',
  library: 'Kutubxona',
  cafe: 'Kafe',
  online: 'Online',
};

export const SCHEDULE_LABELS: Record<Schedule, string> = {
  morning: 'Ertalab',
  day: 'Kunduz',
  evening: 'Kechqurun',
};
