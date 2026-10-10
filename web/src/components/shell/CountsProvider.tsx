'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { Counts } from '@/lib/types';

interface CountsCtx extends Counts {
  /** Re-reads badge counts from the API (call after reading chats/notifications). */
  refresh: () => Promise<void>;
}

const Ctx = createContext<CountsCtx | null>(null);

export function CountsProvider({ initial, children }: { initial: Counts; children: ReactNode }) {
  const [counts, setCounts] = useState(initial);
  const refresh = useCallback(async () => {
    try {
      setCounts(await api.counts());
    } catch {
      /* keep last known counts */
    }
  }, []);
  return <Ctx.Provider value={{ ...counts, refresh }}>{children}</Ctx.Provider>;
}

export function useCounts(): CountsCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCounts must be used inside CountsProvider');
  return c;
}
