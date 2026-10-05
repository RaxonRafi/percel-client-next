'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { api } from './api';
import { useAuth } from './auth-context';
import { getAccessToken } from './auth-storage';
import { SOCKET_URL } from './config';
import type { RealtimeNotification } from './types';

/** Must match `NOTIFICATION_EVENT` in the API's realtime module. */
const NOTIFICATION_EVENT = 'notification';
/** The server keeps no history, so this list is all there is — keep it short. */
const MAX_KEPT = 30;
const TOAST_MS = 6000;

export type AppNotification = RealtimeNotification & { read: boolean };

type NotificationsState = {
  notifications: AppNotification[];
  unread: number;
  /** Newest arrivals still on screen as toasts. */
  toasts: AppNotification[];
  /** False while the socket is down — e.g. an API host without WebSockets. */
  connected: boolean;
  markAllRead: () => void;
  dismissToast: (id: string) => void;
  clear: () => void;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

/**
 * Holds one Socket.IO connection for the signed-in dashboard. Must sit inside
 * `AuthProvider`: it connects once a user is known and drops on sign-out.
 */
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [connected, setConnected] = useState(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      // A function, so every reconnect sends whatever token is current.
      auth: (cb) => cb({ token: getAccessToken() }),
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    // The server answers a stale token with `unauthorized`. `getMe` runs the
    // API client's refresh flow; one retry per rejection, so a session that is
    // really gone does not loop.
    let refreshed = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    socket.on('connect', () => {
      refreshed = false;
      setConnected(true);
    });
    socket.on('disconnect', () => setConnected(false));
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

    socket.on(NOTIFICATION_EVENT, (incoming: RealtimeNotification) => {
      const item: AppNotification = { ...incoming, read: false };
      setNotifications((prev) => [item, ...prev].slice(0, MAX_KEPT));
      setToasts((prev) => [item, ...prev].slice(0, 3));
      const timer = setTimeout(() => {
        timers.delete(timer);
        dismissToast(item.id);
      }, TOAST_MS);
      timers.add(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      socket.removeAllListeners();
      socket.close();
      setConnected(false);
      // A different account must not inherit the previous one's list.
      setNotifications([]);
      setToasts([]);
    };
  }, [userId, dismissToast]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.some((n) => !n.read) ? prev.map((n) => ({ ...n, read: true })) : prev,
    );
  }, []);

  const clear = useCallback(() => setNotifications([]), []);

  const value = useMemo<NotificationsState>(
    () => ({
      notifications,
      unread: notifications.filter((n) => !n.read).length,
      toasts,
      connected,
      markAllRead,
      dismissToast,
      clear,
    }),
    [notifications, toasts, connected, markAllRead, dismissToast, clear],
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
