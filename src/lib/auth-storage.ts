import { clearDataCache } from './data-cache';
import type { User } from './types';

const ACCESS_KEY = 'sp_access_token';
const REFRESH_KEY = 'sp_refresh_token';
const USER_KEY = 'sp_user';
const NOTICE_KEY = 'sp_auth_notice';

/** Notifies hooks in the current tab; `storage` only fires in other tabs. */
const AUTH_EVENT = 'sp-auth-change';

/**
 * A session lives in localStorage by default. With "Keep me signed in" off it
 * goes to sessionStorage instead, so it ends when the tab closes.
 */
function read(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

/** Whichever store holds the current session, so refreshes stay where sign-in put them. */
function activeStore(): Storage {
  return sessionStorage.getItem(REFRESH_KEY) ? sessionStorage : localStorage;
}

function wipe(): void {
  // Cached API data belongs to the session that fetched it.
  clearDataCache();
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(ACCESS_KEY);
    store.removeItem(REFRESH_KEY);
    store.removeItem(USER_KEY);
  }
}

function announce(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function onAuthChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return read(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return read(REFRESH_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuth(
  accessToken: string,
  refreshToken: string,
  user: User,
  { persist = true }: { persist?: boolean } = {},
): void {
  wipe();
  const store = persist ? localStorage : sessionStorage;
  store.setItem(ACCESS_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);
  store.setItem(USER_KEY, JSON.stringify(user));
  announce();
}

/**
 * Replaces both tokens after a refresh. The server rotates on every refresh —
 * the token we sent is revoked — so the new pair must be persisted together or
 * the next refresh is rejected.
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  const store = activeStore();
  store.setItem(ACCESS_KEY, accessToken);
  store.setItem(REFRESH_KEY, refreshToken);
  announce();
}

/** Refreshes the cached profile after `/users/me` or a profile update. */
export function setStoredUser(user: User): void {
  activeStore().setItem(USER_KEY, JSON.stringify(user));
  announce();
}

export function clearAuth(): void {
  wipe();
  announce();
}

/** Why the session was ended server-side, kept for the login screen to show once. */
export function setAuthNotice(message: string): void {
  if (typeof window !== 'undefined') sessionStorage.setItem(NOTICE_KEY, message);
}

export function takeAuthNotice(): string | null {
  if (typeof window === 'undefined') return null;
  const message = sessionStorage.getItem(NOTICE_KEY);
  sessionStorage.removeItem(NOTICE_KEY);
  return message;
}
