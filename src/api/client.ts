/**
 * API client for BizxFlow backend.
 * Auth model: see docs/AUTH_MODEL.md (company vs user accounts, register, login, all-users, add-user).
 */
import type { ApiResponse } from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bizxflow-production.up.railway.app';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<ApiResponse<T>> {
  const { token = getToken(), ...init } = options;
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    ...(init.headers as Record<string, string>),
  };
  if (!(init.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // Use 'omit' so CORS works with backend that sends Access-Control-Allow-Origin: *
  // (with credentials: 'include', the server cannot use * and must send the exact origin)
  const res = await fetch(url, { ...init, headers, credentials: 'omit' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const rawMessage =
      json.message ?? json.error ?? json.msg ?? (Array.isArray(json.errors) && json.errors[0]?.message ? json.errors[0].message : null);
    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : res.status >= 500
          ? 'Server error. Please try again later.'
          : res.statusText || 'Request failed';
    return {
      success: false,
      message,
      status: res.status,
    };
  }
  return json as ApiResponse<T>;
}

// Auth (BizxFlow: company-based, under /api/v1/users/)
export const auth = {
  register: (body: import('../types/api').RegisterBody, logo?: File) => {
    if (logo) {
      const form = new FormData();
      form.append('email', body.email);
      form.append('password', body.password);
      form.append('companyName', body.companyName);
      form.append('logo', logo);
      return apiRequest<import('../types/api').Company>('/api/v1/users/register', {
        method: 'POST',
        body: form,
        token: null,
      });
    }
    return apiRequest<import('../types/api').Company>('/api/v1/users/register', {
      method: 'POST',
      body: JSON.stringify(body),
      token: null,
    });
  },
  login: (body: import('../types/api').LoginBody) =>
    apiRequest<import('../types/api').AuthData>('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify(body),
      token: null,
    }),
  logout: () =>
    apiRequest<unknown>('/api/v1/users/logout', { method: 'POST', body: '{}' }),
  me: () =>
    apiRequest<import('../types/api').MeData>('/api/v1/users/me'),
};

// Users
export const users = {
  updateProfile: (body: import('../types/api').UpdateProfileBody, picture?: File) => {
    if (picture) {
      const form = new FormData();
      if (body.fullName != null) form.append('fullName', body.fullName);
      form.append('picture', picture);
      return apiRequest<{ user: import('../types/api').User }>('/api/v1/users/update-profile', {
        method: 'PATCH',
        body: form,
      });
    }
    return apiRequest<{ user: import('../types/api').User }>('/api/v1/users/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  changePassword: (body: import('../types/api').ChangePasswordBody) =>
    apiRequest<unknown>('/api/v1/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  all: (params?: { search?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return apiRequest<import('../types/api').PaginatedUsers>(
      `/api/v1/users/all-users${q ? `?${q}` : ''}`
    );
  },
  uploadProfilePicture: (file: File) => {
    const form = new FormData();
    form.append('picture', file);
    return apiRequest<{ user?: import('../types/api').User }>('/api/v1/users/update-profile', {
      method: 'PATCH',
      body: form,
    });
  },
  addUser: (body: import('../types/api').AddUserBody, picture?: File) => {
    const form = new FormData();
    form.append('fullName', body.fullName);
    form.append('email', body.email);
    form.append('password', body.password);
    form.append('role', body.role ?? 'Employee');
    if (picture) form.append('picture', picture);
    return apiRequest<import('../types/api').User>('/api/v1/users/add-user', {
      method: 'POST',
      body: form,
    });
  },
};

// Company (company account only)
export const company = {
  update: (body: import('../types/api').UpdateCompanyBody, logo?: File) => {
    if (logo) {
      const form = new FormData();
      if (body.companyName != null) form.append('companyName', body.companyName);
      form.append('logo', logo);
      return apiRequest<import('../types/api').Company>('/api/v1/users/company', {
        method: 'PATCH',
        body: form,
      });
    }
    return apiRequest<import('../types/api').Company>('/api/v1/users/company', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
};

// Attendance
export const attendance = {
  checkIn: () =>
    apiRequest<unknown>('/api/v1/users/checkIn', { method: 'POST', body: '{}' }),
  checkOut: () =>
    apiRequest<unknown>('/api/v1/users/checkOut', { method: 'POST', body: '{}' }),
  myRecord: () =>
    apiRequest<{ records?: import('../types/api').AttendanceRecord[] }>('/api/v1/users/check-record'),
  allRecords: () =>
    apiRequest<{ records?: import('../types/api').AttendanceRecord[] }>('/api/v1/users/record-all'),
};

// Tasks
export const tasks = {
  list: (params?: { search?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return apiRequest<import('../types/api').PaginatedTasks | { tasks: import('../types/api').Task[] }>(
      `/api/v1/users/tasks${q ? `?${q}` : ''}`
    );
  },
  create: (body: import('../types/api').CreateTaskBody) =>
    apiRequest<{ task?: import('../types/api').Task }>('/api/v1/users/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: import('../types/api').UpdateTaskBody) =>
    apiRequest<{ task?: import('../types/api').Task }>(`/api/v1/users/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

// Leave
export const leave = {
  myLeaves: () =>
    apiRequest<{ leaves?: import('../types/api').LeaveRequest[] }>('/api/v1/users/my-leaves'),
  allLeaves: () =>
    apiRequest<{ leaves?: import('../types/api').LeaveRequest[] }>('/api/v1/users/all-leaves'),
  submit: (body: import('../types/api').SubmitLeaveBody) =>
    apiRequest<unknown>('/api/v1/users/submit-leave', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  // Approve/reject: if your backend has this, set the path (e.g. PATCH /api/v1/users/leave/:id)
  update: (id: string, body: import('../types/api').UpdateLeaveBody) =>
    apiRequest<unknown>(`/api/v1/users/leave/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

// Dashboard
export const dashboard = {
  get: () =>
    apiRequest<import('../types/api').DashboardData>('/api/v1/users/dashboard'),
};
