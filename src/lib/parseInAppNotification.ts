import type { InAppNotification } from '@/types/api';

export function parseInAppNotificationDoc(doc: unknown): InAppNotification | null {
  if (doc == null || typeof doc !== 'object' || Array.isArray(doc)) return null;
  const d = doc as Record<string, unknown>;
  const idRaw = d._id ?? d.id;
  const id = typeof idRaw === 'string' ? idRaw : idRaw != null ? String(idRaw) : '';
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
