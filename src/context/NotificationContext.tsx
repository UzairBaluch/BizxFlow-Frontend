/**
 * Notifications: REST for history + unread; Socket.io for live rows (`docs/FRONTEND-SOCKET.md`).
 * **User JWT** → `my-notifications` + `unread-count` under `/api/v1/users/`.
 * **Company JWT** → `company-notifications` + `company-notifications/unread-count`.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as api from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/lib/notificationSocket';
import { parseInAppNotificationDoc } from '@/lib/parseInAppNotification';
import type { InAppNotification } from '@/types/api';

function isApiFailure(raw: unknown): boolean {
  return raw != null && typeof raw === 'object' && (raw as { success?: boolean }).success === false;
}

/** Company-only routes may be unimplemented; retry user inbox with the same company JWT. */
function notificationCompanyFallbackEligible(res: unknown): boolean {
  if (!isApiFailure(res)) return false;
  const st = (res as { status?: number }).status;
  return st === 401 || st === 403 || st === 404;
}

function notificationUserFallbackEligible(res: unknown): boolean {
  if (!isApiFailure(res)) return false;
  const st = (res as { status?: number }).status;
  return st === 401 || st === 403 || st === 404;
}

function asArray(v: unknown): unknown[] | null {
  return Array.isArray(v) ? v : null;
}

function extractFromBag(bag: Record<string, unknown>): unknown[] | null {
  for (const k of [
    'notifications',
    'companyNotifications',
    'inAppNotifications',
    'items',
    'results',
    'docs',
    'list',
    'rows',
  ]) {
    const a = asArray(bag[k]);
    if (a) return a;
  }
  return null;
}

function extractNotificationsPayload(raw: unknown): unknown[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  const r = raw as Record<string, unknown>;
  const top = extractFromBag(r);
  if (top) return top;
  const data = r.data;
  if (Array.isArray(data)) return data;
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    const mid = extractFromBag(d);
    if (mid) return mid;
    const inner = d.data;
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      const deep = extractFromBag(inner as Record<string, unknown>);
      if (deep) return deep;
    }
  }
  return [];
}

function extractUnread(raw: unknown): number {
  const readCount = (bag: Record<string, unknown>): number | null => {
    const n = bag.unreadCount ?? bag.count ?? bag.unread ?? bag.totalUnread;
    if (typeof n === 'number' && Number.isFinite(n)) return n;
    if (typeof n === 'string') {
      const s = n.trim();
      if (s !== '' && /^-?\d+$/.test(s)) {
        const parsed = Number.parseInt(s, 10);
        return Number.isFinite(parsed) ? parsed : null;
      }
    }
    return null;
  };
  const r = raw as Record<string, unknown>;
  const top = readCount(r);
  if (top != null) return top;
  const data = r.data;
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = readCount(data as Record<string, unknown>);
    if (inner != null) return inner;
  }
  return 0;
}

/** Server may emit the document or wrap it (`notification`, `data`, `doc`, etc.). */
function unwrapSocketNotificationPayload(payload: unknown): Record<string, unknown> | null {
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  const inner = p.notification ?? p.data ?? p.doc ?? p.payload ?? p.record ?? p.item ?? p.row;
  if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return p;
}

type NotificationContextValue = {
  notifications: InAppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const LIST_PARAMS = { limit: 50, page: 1 } as const;

export function NotificationProvider({ children }: { children: ReactNode }): React.ReactElement {
  const { token, loading: authLoading, user, accountType } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const hasToken = token != null && token.length > 0;
  const isTeamUserSession = accountType === 'user' && user != null && hasToken;
  /** Company JWT inbox routes — do not require `company` from /me (Bell/API still work with Bearer only). */
  const isCompanySession = accountType === 'company' && hasToken;
  // Even if accountType mismatches (e.g. switching tokens without state update), we still
  // have a token; we can attempt both user/company inbox endpoints as fallbacks.
  const isNotificationSession = hasToken && (isTeamUserSession || isCompanySession || accountType != null);

  const fetchUnread = useCallback(async () => {
    if (!isNotificationSession) return;
    // Preferred based on session type:
    let res = isCompanySession ? await api.notifications.companyUnreadCount() : await api.notifications.unreadCount();

    // If we tried company inbox but it's forbidden/unimplemented, try user inbox.
    if (isCompanySession && notificationCompanyFallbackEligible(res)) {
      if (import.meta.env.DEV) console.warn('[notifications] company unread route failed; retrying user unread');
      res = await api.notifications.unreadCount();
    }

    // If we tried user inbox but it's forbidden/unimplemented, try company inbox.
    if (!isCompanySession && isTeamUserSession && notificationUserFallbackEligible(res)) {
      if (import.meta.env.DEV) console.warn('[notifications] user unread route failed; retrying company unread');
      res = await api.notifications.companyUnreadCount();
    }

    if (isApiFailure(res)) return;
    setUnreadCount(extractUnread(res));
  }, [isNotificationSession, isCompanySession, isTeamUserSession]);

  const fetchList = useCallback(async () => {
    if (!isNotificationSession) return;
    let res = isCompanySession
      ? await api.notifications.companyInbox({ ...LIST_PARAMS })
      : await api.notifications.mine({ ...LIST_PARAMS });

    if (isCompanySession && notificationCompanyFallbackEligible(res)) {
      if (import.meta.env.DEV) console.warn('[notifications] company inbox route failed; retrying user inbox');
      res = await api.notifications.mine({ ...LIST_PARAMS });
    }

    if (!isCompanySession && isTeamUserSession && notificationUserFallbackEligible(res)) {
      if (import.meta.env.DEV) console.warn('[notifications] user inbox route failed; retrying company inbox');
      res = await api.notifications.companyInbox({ ...LIST_PARAMS });
    }

    if (isApiFailure(res)) {
      setNotifications([]);
      const msg =
        typeof (res as { message?: string }).message === 'string'
          ? (res as { message: string }).message
          : 'Could not load notifications.';
      addToast(msg, 'error');
      return;
    }

    const parseRes = (r: unknown): InAppNotification[] => {
      const arr = extractNotificationsPayload(r);
      return arr
        .map((row) => parseInAppNotificationDoc(row))
        .filter((x): x is InAppNotification => x != null);
    };

    setNotifications(parseRes(res));
  }, [isNotificationSession, isCompanySession, isTeamUserSession, addToast]);

  const refresh = useCallback(async () => {
    if (!isNotificationSession) return;
    setLoading(true);
    try {
      await Promise.all([fetchList(), fetchUnread()]);
    } finally {
      setLoading(false);
    }
  }, [isNotificationSession, fetchList, fetchUnread]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!isNotificationSession) return;
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      let res = isCompanySession
        ? await api.notifications.companyMarkRead(notificationId)
        : await api.notifications.markRead(notificationId);
      if (notificationCompanyFallbackEligible(res) && isCompanySession) {
        res = await api.notifications.markRead(notificationId);
      }
      if (notificationUserFallbackEligible(res) && !isCompanySession && isTeamUserSession) {
        res = await api.notifications.companyMarkRead(notificationId);
      }
      if (isApiFailure(res)) {
        const msg =
          typeof (res as { message?: string }).message === 'string'
            ? (res as { message: string }).message
            : 'Could not mark notification read.';
        addToast(msg, 'error');
        await refresh();
        return;
      }
      await fetchUnread();
    },
    [isNotificationSession, isCompanySession, isTeamUserSession, addToast, refresh, fetchUnread]
  );

  const markAllAsRead = useCallback(async () => {
    if (!isNotificationSession) return;
    let res = isCompanySession ? await api.notifications.companyMarkAllRead() : await api.notifications.markAllRead();
    if (notificationCompanyFallbackEligible(res) && isCompanySession) {
      res = await api.notifications.markAllRead();
    }
    if (notificationUserFallbackEligible(res) && !isCompanySession && isTeamUserSession) {
      res = await api.notifications.companyMarkAllRead();
    }
    if (isApiFailure(res)) {
      const msg =
        typeof (res as { message?: string }).message === 'string'
          ? (res as { message: string }).message
          : 'Could not mark all as read.';
      addToast(msg, 'error');
      await refresh();
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [isNotificationSession, isCompanySession, isTeamUserSession, addToast, refresh]);

  useEffect(() => {
    if (authLoading) return;

    if (!isNotificationSession) {
      disconnectNotificationSocket();
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const boot = async (): Promise<void> => {
      setLoading(true);
      try {
        await Promise.all([fetchList(), fetchUnread()]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void boot();

    const sock = connectNotificationSocket(token!);
    const onNotification = (payload: unknown): void => {
      const doc = unwrapSocketNotificationPayload(payload);
      if (doc == null) return;
      const n = parseInAppNotificationDoc(doc);
      if (!n) {
        if (import.meta.env.DEV) {
          console.warn('[notifications socket] skipped event (missing _id/id):', doc);
        }
        return;
      }
      setNotifications((prev) => (prev.some((x) => x._id === n._id) ? prev : [n, ...prev]));
      void fetchUnread();
      addToast(n.title ? `New: ${n.title}` : 'New notification', 'success');
    };
    const socketEvents =
      (import.meta.env.VITE_NOTIFICATION_SOCKET_EVENTS as string | undefined)
        ?.split(',')
        .map((ev) => ev.trim())
        .filter((ev) => ev.length > 0) ??
      [
        'notification',
        'notifications',
        'newNotification',
        'new_notification',
        'in_app_notification',
        'inAppNotification',
        'announcement',
        'announcement_created',
        'announcementCreated',
        'new_announcement',
        'attendance',
        'attendance_notification',
      ];
    for (const ev of socketEvents) {
      sock.on(ev, onNotification);
    }

    return () => {
      cancelled = true;
      for (const ev of socketEvents) {
        sock.off(ev, onNotification);
      }
      disconnectNotificationSocket();
    };
  }, [authLoading, isNotificationSession, token, addToast, fetchList, fetchUnread]);

  /** Tab focus / visibility: catch rows the socket missed (common for company sessions). */
  useEffect(() => {
    if (!isNotificationSession) return;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const pull = (): void => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(debounce);
      debounce = setTimeout(() => {
        void fetchList();
        void fetchUnread();
      }, 450);
    };
    document.addEventListener('visibilitychange', pull);
    window.addEventListener('focus', pull);
    return () => {
      document.removeEventListener('visibilitychange', pull);
      window.removeEventListener('focus', pull);
      window.clearTimeout(debounce);
    };
  }, [isNotificationSession, fetchList, fetchUnread]);

  /** Optional poll when `VITE_NOTIFICATION_POLL_MS` is set (e.g. 30000). */
  useEffect(() => {
    if (!isNotificationSession) return;
    const raw = (import.meta.env.VITE_NOTIFICATION_POLL_MS as string | undefined)?.trim();
    const ms = raw != null && raw !== '' ? Number(raw) : NaN;
    if (!Number.isFinite(ms) || ms < 15000) return;
    const id = window.setInterval(() => {
      void fetchList();
      void fetchUnread();
    }, ms);
    return () => window.clearInterval(id);
  }, [isNotificationSession, fetchList, fetchUnread]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
