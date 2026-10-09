'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { readCache, writeCache } from './data-cache';

type State<T> = {
  key: string | null;
  data: T | undefined;
  /** When `data` was fetched (ms since epoch). */
  updatedAt: number | null;
  error: string;
  refreshing: boolean;
};

type Options<T> = {
  /** Background refresh interval while the tab is visible. 0 turns it off. */
  refreshMs?: number;
  /** Server-rendered data to start from (e.g. from an ISR page). */
  initialData?: T;
  /** Also keep the entry in sessionStorage so it survives a reload. */
  persist?: boolean;
};

function initial<T>(key: string | null, options: Options<T>): State<T> {
  const cached = key ? readCache<T>(key, options.persist ?? true) : null;
  if (cached) return { key, data: cached.data, updatedAt: cached.at, error: '', refreshing: false };
  return {
    key,
    data: options.initialData,
    updatedAt: options.initialData === undefined ? null : Date.now(),
    error: '',
    refreshing: false,
  };
}

/**
 * Stale-while-revalidate for client-fetched data — the browser-side counterpart
 * of ISR. Returns whatever is cached for `key` straight away, fetches a fresh
 * copy in the background, and repeats on an interval and when the tab regains
 * focus. Pass `null` as the key to hold off (e.g. until the user is known).
 *
 * Include anything the data depends on in the key — for private data, the
 * user id — so entries can never be shared across accounts.
 */
export function useCached<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: Options<T> = {},
) {
  const { refreshMs = 30_000, persist = true } = options;
  const [state, setState] = useState<State<T>>(() => initial(key, options));

  // A different key is a different resource: start again from its cache entry.
  if (state.key !== key) setState(initial(key, options));

  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);
  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  });

  const run = useCallback(
    async (showProgress: boolean) => {
      if (!key) return;
      if (showProgress) setState((s) => ({ ...s, refreshing: true }));
      try {
        const data = await fetcherRef.current();
        // The key moved on while this was in flight; the result belongs to no one.
        if (keyRef.current !== key) return;
        const at = Date.now();
        writeCache(key, { data, at }, persist);
        setState({ key, data, updatedAt: at, error: '', refreshing: false });
      } catch (err) {
        if (keyRef.current !== key) return;
        // Keep showing the stale data; only surface that the refresh failed.
        setState((s) => ({
          ...s,
          error: err instanceof Error ? err.message : 'Could not refresh',
          refreshing: false,
        }));
      }
    },
    [key, persist],
  );

  useEffect(() => {
    if (!key) return;
    run(false);

    const onVisible = () => {
      if (document.visibilityState === 'visible') run(false);
    };
    document.addEventListener('visibilitychange', onVisible);

    const timer =
      refreshMs > 0
        ? setInterval(() => {
            if (document.visibilityState === 'visible') run(false);
          }, refreshMs)
        : null;

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (timer) clearInterval(timer);
    };
  }, [key, refreshMs, run]);

  return {
    data: state.data,
    updatedAt: state.updatedAt,
    error: state.error,
    /** True only for a refresh the user asked for. */
    refreshing: state.refreshing,
    /** No data yet and nothing cached — the very first load. */
    loading: state.data === undefined && !state.error,
    /** Fetch now. `silent` skips the `refreshing` flag (for background triggers). */
    refresh: useCallback((silent = false) => run(!silent), [run]),
  };
}
