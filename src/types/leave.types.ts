export const LeaveStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
} as const
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus]

export interface Leave {
  _id: string
  user: string | { _id: string; fullName: string }
  startDate: string
  endDate: string
  reason?: string
  status: LeaveStatus
  createdAt?: string
}

export interface ApplyLeavePayload {
  startDate: string
  endDate: string
  reason?: string
}
