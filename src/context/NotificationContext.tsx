/**
 * User-session notifications: REST for history + unread count; Socket.io for new rows only.
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

function extractNotificationsPayload(raw: unknown): unknown[] {
  const r = raw as Record<string, unknown>;
  if (Array.isArray(r.notifications)) return r.notifications;
  const data = r.data;
  if (Array.isArray(data)) return data;
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.notifications)) return d.notifications;
    if (Array.isArray(d.items)) return d.items;
    if (Array.isArray(d.results)) return d.results;
    const inner = d.data;
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      const n = (inner as { notifications?: unknown }).notifications;
      if (Array.isArray(n)) return n;
    }
  }
  return [];
}

function extractUnread(raw: unknown): number {
  const readCount = (bag: Record<string, unknown>): number | null => {
    const n = bag.unreadCount ?? bag.count ?? bag.unread ?? bag.totalUnread;
    return typeof n === 'number' && Number.isFinite(n) ? n : null;
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

/** Server may emit the document or wrap it (`notification`, `data`, `doc`). */
function unwrapSocketNotificationPayload(payload: unknown): Record<string, unknown> | null {
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const p = payload as Record<string, unknown>;
  const inner = p.notification ?? p.data ?? p.doc;
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
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }): React.ReactElement {
  const { token, loading: authLoading, user, company } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /** Team user JWT: `/me` may omit `type`; `user` + no `company` matches login shape. */
  const isUserSession =
    token != null && token.length > 0 && user != null && company == null;

  const fetchUnread = useCallback(async () => {
    if (!isUserSession) return;
    const res = await api.notifications.unreadCount();
    if (isApiFailure(res)) return;
    setUnreadCount(extractUnread(res));
  }, [isUserSession]);

  const fetchList = useCallback(async () => {
    if (!isUserSession) return;
    const res = await api.notifications.mine({ limit: 50, page: 1 });
    if (isApiFailure(res)) {
      setNotifications([]);
      const msg =
        typeof (res as { message?: string }).message === 'string'
          ? (res as { message: string }).message
          : 'Could not load notifications.';
      addToast(msg, 'error');
      return;
    }
    const arr = extractNotificationsPayload(res);
    const parsed = arr
      .map((row) => parseInAppNotificationDoc(row))
      .filter((x): x is InAppNotification => x != null);
    setNotifications(parsed);
  }, [isUserSession, addToast]);

  const refresh = useCallback(async () => {
    if (!isUserSession) return;
    setLoading(true);
    try {
      await Promise.all([fetchList(), fetchUnread()]);
    } finally {
      setLoading(false);
    }
  }, [isUserSession, fetchList, fetchUnread]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!isUserSession) return;
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      const res = await api.notifications.markRead(notificationId);
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
    [isUserSession, addToast, refresh, fetchUnread]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isUserSession) {
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
      if (!n) return;
      setNotifications((prev) => (prev.some((x) => x._id === n._id) ? prev : [n, ...prev]));
      void fetchUnread();
      addToast(n.title ? `New: ${n.title}` : 'New notification', 'success');
    };
    sock.on('notification', onNotification);

    return () => {
      cancelled = true;
      sock.off('notification', onNotification);
      disconnectNotificationSocket();
    };
  }, [authLoading, isUserSession, token, addToast, fetchList, fetchUnread]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
