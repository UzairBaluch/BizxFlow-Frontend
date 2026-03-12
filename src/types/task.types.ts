export const TaskStatus = {
  Todo: 'pending',
  InProgress: 'in-progress',
  Done: 'completed',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  assignedTo?: string
  createdBy?: string
  dueDate?: string
  priority?: string
  createdAt?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  assignedTo?: string
  dueDate?: string
  priority?: string
}
