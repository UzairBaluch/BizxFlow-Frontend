import type { TaskStatus } from './task.types'
import type { LeaveStatus } from './leave.types'

export interface DashboardStats {
  totalEmployees?: number
  totalTasks?: number
  totalLeaves?: number
  todayAttendance?: number
}

export interface StatusCount<T = string> {
  _id: T
  count: number
}

export interface DashboardData {
  totalEmployees?: number
  totalTasks?: number
  totalLeaves?: number
  todayAttendance?: number
  tasksByStatus?: StatusCount<TaskStatus>[]
  leavesByStatus?: StatusCount<LeaveStatus>[]
}

export interface RecentActivity {
  _id: string
  user?: { fullName: string; profilePicture?: string }
  action: string
  time: string
}
