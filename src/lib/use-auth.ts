'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from './api';
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  onAuthChange,
  setStoredUser,
} from './auth-storage';
import type { User } from './types';

/**
 * The layout and the page below it both mount this hook, so share one
 * in-flight `/users/me` between them instead of firing it twice per view.
 */
let pendingMe: Promise<User> | null = null;

function fetchMe(): Promise<User> {
  if (!pendingMe) {
    pendingMe = api.getMe().finally(() => {
      pendingMe = null;
    });
  }
  return pendingMe;
}

type AuthState = {
  user: User | null;
  /** true until the stored session has been read and verified after mount */
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Reads the session only after mount — localStorage is unavailable during the
 * server render, so touching it while rendering produces a hydration mismatch.
 * The cached user paints immediately; `GET /users/me` then confirms the token
 * is still good and refreshes the profile.
 */
export function useAuth({ redirectTo }: { redirectTo?: string } = {}): AuthState {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      if (redirectTo) router.replace(redirectTo);
      return;
    }

    setUser(getStoredUser());

    try {
      const me = await fetchMe();
      setStoredUser(me);
      setUser(me);
    } catch (err) {
      // 401 survives the refresh-token retry inside `request`, so the session
      // is genuinely gone. Any other failure (network, 500) keeps the cache.
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
        setUser(null);
        if (redirectTo) router.replace(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => onAuthChange(() => setUser(getStoredUser())), []);

  return { user, loading, refresh: load };
}
