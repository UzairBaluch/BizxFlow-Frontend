export const AttendanceStatus = {
  Present: 'Present',
  Absent: 'Absent',
  Late: 'Late',
} as const
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus]

export interface AttendanceRecord {
  _id: string
  user: string | { _id: string; fullName: string }
  date: string
  checkIn?: string
  checkOut?: string
  status?: AttendanceStatus
  hours?: number
}
