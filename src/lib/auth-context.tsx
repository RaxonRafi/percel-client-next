'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

type Status = 'initializing' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: User | null;
  status: Status;
  /** True only while the cached session is read — no network call involved. */
  loading: boolean;
  /** Re-verifies against `GET /users/me`. */
  refresh: () => Promise<void>;
  /** Pushes a locally-updated profile in without another round trip. */
  applyUser: (user: User) => void;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Owns the session for the whole authenticated tree: one `GET /users/me` per
 * mount, shared by the layout and every page under it.
 *
 * The cached user is applied first so pages can start their own fetches
 * immediately, and `/users/me` verifies in parallel rather than in front.
 */
export function AuthProvider({
  children,
  redirectTo = '/login',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('initializing');
  const started = useRef(false);

  /**
   * Keeps object identity stable when the record has not actually changed.
   * Every caller here mints a fresh object (`JSON.parse`, an API response), and
   * effects downstream key on the user — without this they refire and refetch.
   */
  const commit = useCallback((next: User | null) => {
    setUser((prev) => {
      if (prev && next && JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, []);

  const verify = useCallback(async () => {
    try {
      const me = await api.getMe();
      setStoredUser(me);
      commit(me);
      setStatus('authenticated');
    } catch (err) {
      // A 401 already survived the refresh-token retry inside `request`, so the
      // session is genuinely gone. Network or 5xx failures keep the cache.
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
        commit(null);
        setStatus('unauthenticated');
      }
    }
  }, [commit]);

  useEffect(() => {
    // Guarded so StrictMode's double-invoke does not double-fetch in dev.
    if (started.current) return;
    started.current = true;

    // localStorage is read after mount: it does not exist during the server
    // render, and touching it while rendering breaks hydration.
    if (!getAccessToken()) {
      setStatus('unauthenticated');
      return;
    }

    const cached = getStoredUser();
    if (cached) {
      // Unblocks the tree now; verification continues alongside page fetches.
      commit(cached);
      setStatus('authenticated');
    }
    verify();
  }, [commit, verify]);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace(redirectTo);
  }, [status, redirectTo, router]);

  // Signing out in another tab should not leave this one on a stale session.
  useEffect(
    () =>
      onAuthChange(() => {
        if (!getAccessToken()) {
          commit(null);
          setStatus('unauthenticated');
          return;
        }
        commit(getStoredUser());
      }),
    [commit],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      loading: status === 'initializing',
      refresh: verify,
      applyUser: (next: User) => {
        setStoredUser(next);
        commit(next);
      },
    }),
    [user, status, verify, commit],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
