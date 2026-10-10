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
import { io } from 'socket.io-client';
import { api, ApiError } from './api';
import { useAuth } from './auth-context';
import { clearAuth, getAccessToken } from './auth-storage';
import { SOCKET_URL } from './config';
import type { RealtimeNotification, StoredNotification } from './types';

/** Must match `NOTIFICATION_EVENT` in the API's realtime module. */
const NOTIFICATION_EVENT = 'notification';
/** What the bell shows; the server keeps 90 days behind it. */
const MAX_KEPT = 30;
const TOAST_MS = 6000;
/** How often the inbox is re-read when there is no live connection. */
const POLL_MS = 60_000;

export type AppNotification = RealtimeNotification & { read: boolean };

type NotificationsState = {
  notifications: AppNotification[];
  unread: number;
  /** Newest arrivals still on screen as toasts. */
  toasts: AppNotification[];
  /**
   * True while a socket is open. False on an API host without WebSockets
   * (Vercel), where the inbox is polled instead — notifications still arrive,
   * up to a minute late.
   */
  connected: boolean;
  markAllRead: () => void;
  dismissToast: (id: string) => void;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

const fromStored = (item: StoredNotification): AppNotification => ({
  id: item.id,
  type: item.type,
  title: item.title,
  message: item.message,
  trackingId: item.trackingId ?? '',
  status: item.status ?? 'PENDING',
  createdAt: item.createdAt,
  read: item.readAt !== null,
});

/**
 * The signed-in user's notifications. Must sit inside `AuthProvider`.
 *
 * The inbox on the server is the source of truth: it is read on sign-in, so
 * nothing is lost while the tab was closed. On top of that, updates arrive one
 * of two ways. Where the API can hold a socket open, a Socket.IO connection
 * pushes them the moment they happen. Where it cannot, the API says so in
 * `GET /health` and no socket is attempted at all — the inbox is polled.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);
  /** Ids already shown, so a poll only toasts what is actually new. */
  const seen = useRef<Set<string> | null>(null);
  /** Mirrors `unread` for callbacks that must not re-create on every change. */
  const unreadRef = useRef(0);

  const applyUnread = useCallback((next: number) => {
    unreadRef.current = next;
    setUnread(next);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let poll: ReturnType<typeof setInterval> | undefined;
    let closeSocket: (() => void) | undefined;

    const toast = (items: AppNotification[]) => {
      if (items.length === 0) return;
      setToasts((prev) => [...items, ...prev].slice(0, 3));
      for (const item of items) {
        const timer = setTimeout(() => {
          timers.delete(timer);
          dismissToast(item.id);
        }, TOAST_MS);
        timers.add(timer);
      }
    };

    /** Reads the inbox; anything not seen before is announced. */
    const load = async () => {
      try {
        const [page, count] = await Promise.all([
          api.getNotifications({ limit: MAX_KEPT }),
          api.getUnreadNotificationCount(),
        ]);
        if (cancelled) return;

        const items = page.data.map(fromStored);
        // The first read is history, not news.
        const known = seen.current;
        const fresh = known
          ? items.filter((item) => !item.read && !known.has(item.id))
          : [];
        seen.current = new Set(items.map((item) => item.id));

        setNotifications(items);
        applyUnread(count.unread);
        toast(fresh);
      } catch {
        // An API without the inbox routes, or a blip: keep what is on screen.
      }
    };

    const startPolling = () => {
      poll = setInterval(load, POLL_MS);
      window.addEventListener('focus', load);
    };

    const openSocket = () => {
      const socket = io(SOCKET_URL, {
        // A function, so every reconnect sends whatever token is current.
        auth: (cb) => cb({ token: getAccessToken() }),
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      // The server answers a stale token with `unauthorized`. `getMe` runs the
      // API client's refresh flow; one retry per rejection, so a session that
      // is really gone does not loop.
      let refreshed = false;

      socket.on('connect', () => {
        refreshed = false;
        setConnected(true);
        // Catch up on anything raised while the socket was down.
        load();
      });
      socket.on('disconnect', (reason) => {
        setConnected(false);
        // The server closes the socket when the account is blocked, and
        // Socket.IO does not reconnect by itself after that. Ask the API: a
        // dead session signs the user out, a live one is safe to reconnect.
        if (reason !== 'io server disconnect') return;
        api
          .getMe()
          .then(() => socket.connect())
          .catch((err) => {
            if (err instanceof ApiError && err.status === 401) clearAuth();
          });
      });
      socket.on('connect_error', (err) => {
        setConnected(false);
        if (err.message !== 'unauthorized' || refreshed) return;
        refreshed = true;
        api
          .getMe()
          .then(() => socket.connect())
          .catch(() => {
            // AuthProvider handles a dead session; nothing to do here.
          });
      });
      // Out of retries: the host is not serving sockets after all.
      socket.io.on('reconnect_failed', () => {
        if (!cancelled && !poll) startPolling();
      });

      socket.on(NOTIFICATION_EVENT, (incoming: RealtimeNotification) => {
        // The push carries the id of the inbox row, so a later read of the
        // inbox recognises it instead of announcing it twice.
        if (seen.current?.has(incoming.id)) return;
        seen.current?.add(incoming.id);

        const item: AppNotification = { ...incoming, read: false };
        setNotifications((prev) => [item, ...prev].slice(0, MAX_KEPT));
        applyUnread(unreadRef.current + 1);
        toast([item]);
      });

      closeSocket = () => {
        socket.removeAllListeners();
        socket.io.removeAllListeners();
        socket.close();
      };
    };

    (async () => {
      await load();
      if (cancelled) return;

      // Ask before dialling: a serverless API cannot hold a socket open, and
      // trying anyway only fills the console with failed handshakes.
      const realtime = await api
        .getHealth()
        .then((health) => health.realtime)
        .catch(() => false);
      if (cancelled) return;

      if (realtime) openSocket();
      else startPolling();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (poll) clearInterval(poll);
      window.removeEventListener('focus', load);
      closeSocket?.();
      seen.current = null;
      setConnected(false);
      // A different account must not inherit the previous one's list.
      setNotifications([]);
      applyUnread(0);
      setToasts([]);
    };
  }, [userId, dismissToast, applyUnread]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.some((n) => !n.read) ? prev.map((n) => ({ ...n, read: true })) : prev,
    );
    // Only worth a request when there was something to mark.
    if (unreadRef.current === 0) return;
    applyUnread(0);
    api.markAllNotificationsRead().catch(() => {
      // The next read of the inbox puts the badge back if this failed.
    });
  }, [applyUnread]);

  const value = useMemo<NotificationsState>(
    () => ({ notifications, unread, toasts, connected, markAllRead, dismissToast }),
    [notifications, unread, toasts, connected, markAllRead, dismissToast],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsState {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
