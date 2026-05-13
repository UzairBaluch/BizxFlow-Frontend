import type { InAppNotification } from '@/types/api'

function normType(t: string | undefined): string {
  return (t ?? '').trim().toUpperCase().replace(/\s+/g, '_')
}

const TASK_TYPES = new Set(['TASK_ASSIGNED', 'TASK_STATUS_UPDATED'])
const LEAVE_TYPES = new Set(['LEAVE_SUBMITTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED'])
const ATT_TYPES = new Set(['ATTENDANCE_CHECK_IN', 'ATTENDANCE_CHECK_OUT'])

function metaString(m: Record<string, unknown> | undefined, keys: string[]): boolean {
  if (m == null) return false
  for (const k of keys) {
    const v = m[k]
    if (v != null && String(v).trim() !== '') return true
  }
  return false
}

/**
 * Route target for bell / list / sidebar badges.
 * Keys align with backend `enrichNotificationMetadata()` (canonical + aliases); unknown keys still work via `type` substring fallbacks.
 */
export function notificationTargetPath(n: InAppNotification): string | null {
  const ty = normType(n.type)
  const m = n.metadata as Record<string, unknown> | undefined

  if (metaString(m, ['taskId', 'assignedTaskId', 'task_id', 'assigneeId'])) return '/tasks'
  // Attendance before leave — org check-in/out payloads often include `employeeId` only
  if (ATT_TYPES.has(ty) || ty.includes('ATTENDANCE')) return '/attendance'
  if (metaString(m, ['attendanceId', 'attendanceRecordId', 'recordId', 'checkInId', 'checkOutId'])) return '/attendance'
  if (
    metaString(m, [
      'leaveId',
      'leaveRequestId',
      'requestId',
      'leave_id',
      'submittedLeaveId',
      'reviewedLeaveId',
      'employeeId',
      'submitterId',
      'applicantId',
    ])
  )
    return '/leave'
  if (ty.includes('LEAVE') && metaString(m, ['userId'])) return '/leave'
  if (metaString(m, ['announcementId', 'announcement_id'])) return '/announcements'

  if (TASK_TYPES.has(ty)) return '/tasks'
  if (LEAVE_TYPES.has(ty) || ty.includes('LEAVE')) return '/leave'
  if (ty === 'ANNOUNCEMENT_CREATED' || ty.includes('ANNOUNCEMENT')) return '/announcements'

  return null
}
