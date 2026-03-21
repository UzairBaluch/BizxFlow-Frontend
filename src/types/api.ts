/**
 * API types. Auth model (company vs user): see docs/AUTH_MODEL.md.
 */
export type Role = 'Admin' | 'Manager' | 'Employee';

export type AccountType = 'company' | 'user';

export type Company = {
  _id: string;
  email: string;
  companyName: string;
  logo?: string;
  createdAt?: string;
};

export type User = {
  _id: string;
  email: string;
  fullName: string;
  role: Role;
  /** Tenant; set by backend for user JWT */
  companyId?: string;
  profilePicture?: string;
  createdAt?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  statusCode?: number;
};

export type ApiError = {
  success: false;
  message: string;
  status?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Auth (company-based)
export type RegisterBody = { email: string; password: string; companyName: string };
export type LoginBody = { email: string; password: string };
export type AuthData = {
  type: AccountType;
  company?: Company;
  user?: User;
  accessToken: string;
  refreshToken?: string;
};
export type MeData = { type: AccountType; company?: Company; user?: User };

// Profile
export type UpdateProfileBody = { fullName?: string };
export type UpdateCompanyBody = { companyName?: string };
export type ChangePasswordBody = { currentPassword: string; newPassword: string };

// Attendance
export type AttendanceRecord = {
  _id: string;
  user: string | User;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
};

// Tasks (aligned with Mongoose: Pending | In Progress | Done; assignedTo & createdBy required)
import type { TaskStatus } from './task.types';

export type { TaskStatus } from './task.types';

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo: string | User;
  createdBy: string | User;
  /** Populated on GET /all-tasks for admin/company UIs */
  createdByCompany?: string | Pick<Company, 'companyName'>;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateTaskBody = {
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: string;
};
/** PATCH /tasks/:id — assignee only; body is status per API spec */
export type UpdateTaskBody = { status: TaskStatus };

// Leave
/** List/detail status from API (may be lowercase or Title Case) */
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected';
/** POST /submit-leave */
export type LeaveTypeSubmit = 'Sick' | 'Casual' | 'Annual';
/** PATCH /update-leave/:id */
export type LeaveReviewStatus = 'Approved' | 'Rejected';
export type LeaveRequest = {
  _id: string;
  user: string | User;
  /** Some APIs populate this instead of or in addition to `user` */
  employee?: string | User;
  submittedBy?: string | User;
  applicant?: string | User;
  companyId?: string;
  startDate: string;
  endDate: string;
  leaveType?: string;
  reason?: string;
  status: LeaveStatus;
  /** Set when a user (Admin/Manager) approved/rejected */
  reviewedBy?: string | User | null;
  /** Set when the company account approved/rejected */
  reviewedByCompany?: string | Company | null;
  createdAt?: string;
};
export type SubmitLeaveBody = {
  leaveType: LeaveTypeSubmit;
  startDate: string;
  endDate: string;
  reason?: string;
};
export type UpdateLeaveBody = { status: LeaveReviewStatus };

// Dashboard
export type DashboardData = {
  /**
   * All user accounts in the tenant (Admin + Manager + Employee). Excludes the company login entity.
   * Prefer this over `totalEmployees` when the API provides it.
   */
  totalTeamMembers?: number;
  /** Legacy / alias — should match team size (users only, not company account). */
  totalEmployees?: number;
  totalUsers?: number;
  totalTasks?: number;
  totalLeaves?: number;
  /** Pending leave count only (preferred for "action queue" card). */
  totalPendingLeaves?: number;
  todayAttendance?: number;
  tasksByStatus?: { _id: TaskStatus; count: number }[];
  leavesByStatus?: { _id: LeaveStatus; count: number }[];
};

// Add user (company or Admin/Manager)
export type AddUserBody = { fullName: string; email: string; password: string; role?: Role };
/** PATCH update-user-role/:userId — company JWT or Admin/Manager */
export type UpdateUserRoleBody = { role: Role };

// Paginated
export type PaginatedUsers = { users: User[]; totalUsers: number };
export type PaginatedTasks = {
  tasks: Task[];
  totalTasks: number;
  page?: number;
  limit?: number;
};

// Announcements
export type Announcement = {
  _id: string;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
};
export type CreateAnnouncementBody = { title: string; body: string };
