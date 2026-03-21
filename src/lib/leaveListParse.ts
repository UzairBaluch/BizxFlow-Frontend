import type { LeaveRequest } from '@/types/api'

function normalizeLeaveRow(raw: LeaveRequest): LeaveRequest {
  const row = raw as Record<string, unknown>
  let user = raw.user
  if ((user == null || user === '') && raw.employee != null) {
    user = raw.employee
  }
  if ((user == null || user === '') && row.submittedBy != null) {
    user = row.submittedBy as LeaveRequest['user']
  }
  if ((user == null || user === '') && row.applicant != null) {
    user = row.applicant as LeaveRequest['user']
  }
  if (user !== raw.user) {
    return { ...raw, user }
  }
  return raw
}

export function isLeavesListOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true) return true
  if (r.data != null) return true
  if (Array.isArray(r.leaves)) return true
  if (typeof r._httpStatus === 'number' && r._httpStatus >= 200 && r._httpStatus < 300) return true
  return false
}

export function parseLeavesFromResponse(res: unknown): LeaveRequest[] {
  if (res == null || typeof res !== 'object') return []
  const r = res as Record<string, unknown>
  const raw = r.data !== undefined && r.data !== null ? r.data : r
  const mapLeaves = (arr: LeaveRequest[]): LeaveRequest[] => arr.map((item) => normalizeLeaveRow(item))

  if (Array.isArray(raw)) return mapLeaves(raw as LeaveRequest[])
  if (typeof raw === 'object' && raw !== null) {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.leaves)) return mapLeaves(o.leaves as LeaveRequest[])
    if (Array.isArray(o.items)) return mapLeaves(o.items as LeaveRequest[])
    if (Array.isArray(o.results)) return mapLeaves(o.results as LeaveRequest[])
  }
  if (Array.isArray(r.leaves)) return mapLeaves(r.leaves as LeaveRequest[])
  return []
}
