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
  profilePicture?: string;
  createdAt?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
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

// Tasks
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string | User;
  createdBy?: string | User;
  createdAt?: string;
};
export type CreateTaskBody = { title: string; description?: string; assignedTo?: string };
export type UpdateTaskBody = { status?: TaskStatus; title?: string; description?: string; assignedTo?: string };

// Leave
export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveRequest = {
  _id: string;
  user: string | User;
  startDate: string;
  endDate: string;
  reason?: string;
  status: LeaveStatus;
  createdAt?: string;
};
export type SubmitLeaveBody = { startDate: string; endDate: string; reason?: string };
export type UpdateLeaveBody = { status: LeaveStatus };

// Dashboard
export type DashboardData = {
  totalEmployees?: number;
  totalTasks?: number;
  totalLeaves?: number;
  todayAttendance?: number;
  tasksByStatus?: { _id: TaskStatus; count: number }[];
  leavesByStatus?: { _id: LeaveStatus; count: number }[];
};

// Add user (company or Admin/Manager)
export type AddUserBody = { fullName: string; email: string; password: string; role?: Role };

// Paginated
export type PaginatedUsers = { users: User[]; totalUsers: number };
export type PaginatedTasks = { tasks: Task[]; totalTasks: number };
