import type { InAppNotification } from '@/types/api';

function notificationIdString(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  if (typeof raw === 'object' && raw !== null && '$oid' in raw && typeof (raw as { $oid: unknown }).$oid === 'string') {
    return (raw as { $oid: string }).$oid.trim();
  }
  return '';
}

export function parseInAppNotificationDoc(doc: unknown): InAppNotification | null {
  if (doc == null || typeof doc !== 'object' || Array.isArray(doc)) return null;
  const d = doc as Record<string, unknown>;
  const id = notificationIdString(d._id ?? d.id ?? d.notificationId ?? d.notification_id);
  if (!id) return null;
  const title = typeof d.title === 'string' ? d.title : '';
  const body = typeof d.body === 'string' ? d.body : '';
  const type = typeof d.type === 'string' ? d.type : 'UNKNOWN';
  const read = typeof d.read === 'boolean' ? d.read : false;
  const metadata =
    d.metadata != null && typeof d.metadata === 'object' && !Array.isArray(d.metadata)
      ? (d.metadata as InAppNotification['metadata'])
      : undefined;
  const createdAt = typeof d.createdAt === 'string' ? d.createdAt : undefined;
  const updatedAt = typeof d.updatedAt === 'string' ? d.updatedAt : undefined;
  return { _id: id, type, title, body, read, metadata, createdAt, updatedAt };
}
