"use client";

import { useEffect, useState } from 'react';
import type { ServerUserSession } from '@/types/auth';

type UserState = {
  user: ServerUserSession | null;
  loading: boolean;
  error: string | null;
};

export function useUser(): UserState {
  const [user, setUser] = useState<ServerUserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load user: ${res.status}`);
        }
        const data = (await res.json()) as { data: ServerUserSession | null };
        if (!cancelled) {
          setUser(data.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading, error };
}
