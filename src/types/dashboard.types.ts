import type { TaskStatus } from './task.types'
import type { LeaveStatus } from './leave.types'

export interface DashboardStats {
  /** User accounts only (Admin, Manager, Employee); not the company account. */
  totalTeamMembers?: number
  totalEmployees?: number
  totalUsers?: number
  totalTasks?: number
  totalLeaves?: number
  totalPendingLeaves?: number
  todayAttendance?: number
}

export interface StatusCount<T = string> {
  _id: T
  count: number
}

export interface DashboardData {
  totalTeamMembers?: number
  totalEmployees?: number
  totalUsers?: number
  totalTasks?: number
  totalLeaves?: number
  totalPendingLeaves?: number
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
