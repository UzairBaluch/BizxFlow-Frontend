export const Role = {
  Admin: 'admin',
  Manager: 'manager',
  Employee: 'employee',
} as const
export type Role = (typeof Role)[keyof typeof Role]

export interface User {
  _id: string
  email: string
  fullName: string
  role: Role
  profilePicture?: string
  createdAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  role?: Role
}

export interface AuthData {
  user: User
  accessToken: string
}
