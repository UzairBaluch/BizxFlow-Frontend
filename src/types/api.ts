export type Role = 'admin' | 'manager' | 'employee';

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
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Auth
export type RegisterBody = { email: string; password: string; fullName: string; role?: Role };
export type LoginBody = { email: string; password: string };
export type AuthData = { user: User; accessToken: string };

// Profile
export type UpdateProfileBody = { fullName?: string; profilePicture?: string };
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

// Paginated
export type PaginatedUsers = { users: User[]; totalUsers: number };
export type PaginatedTasks = { tasks: Task[]; totalTasks: number };
