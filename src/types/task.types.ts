/** Matches backend Task schema enum */
export const TaskStatus = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Done: 'Done',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export interface CreateTaskPayload {
  title: string
  description?: string
  assignedTo: string
  dueDate?: string
}
