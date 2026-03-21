import { useCallback, useEffect, useState } from 'react'
import { tasks as tasksApi, users as usersApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Task, User } from '@/types/api'
import { TaskStatus } from '@/types/task.types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable, Pagination } from '@/components/ui/DataTable'
import { SlidePanel } from '@/components/ui/SlidePanel'

function userLabel(ref: string | User | undefined | null): string {
  if (ref == null || ref === '') return '—'
  if (typeof ref === 'object' && 'fullName' in ref) return ref.fullName
  return String(ref)
}

function formatDue(d?: string): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return d
  }
}

const selectClassName =
  'rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-2 py-1.5 font-body text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-text)]'

export function TasksPage(): React.ReactElement {
  const { user } = useAuth()
  const [list, setList] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const [panelOpen, setPanelOpen] = useState(false)
  const [assignees, setAssignees] = useState<User[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newAssignedTo, setNewAssignedTo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    tasksApi
      .list({ search: search || undefined, page, limit })
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data as { tasks: Task[]; totalTasks?: number }
          setList(d.tasks ?? [])
          setTotal(d.totalTasks ?? d.tasks?.length ?? 0)
        }
      })
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => {
    load()
  }, [load])

  /** Load users for assignee picker (required on create). */
  useEffect(() => {
    if (!panelOpen) return
    usersApi.all({ page: 1, limit: 100 }).then((res) => {
      if (res.success && res.data?.users?.length) {
        setAssignees(res.data.users)
        setNewAssignedTo((prev) => prev || (user?._id && res.data!.users!.some((u) => u._id === user._id) ? user._id : res.data!.users![0]._id))
      } else if (user) {
        setAssignees([user])
        setNewAssignedTo(user._id)
      } else {
        setAssignees([])
        setNewAssignedTo('')
      }
    })
  }, [panelOpen, user])

  function handleCreate(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!newTitle.trim()) {
      addToast('Title is required.', 'error')
      return
    }
    if (!newAssignedTo) {
      addToast('Assignee is required.', 'error')
      return
    }
    setSubmitting(true)
    tasksApi
      .create({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        assignedTo: newAssignedTo,
        ...(newDueDate ? { dueDate: `${newDueDate}T12:00:00.000Z` } : {}),
      })
      .then((res) => {
        if (res.success) {
          addToast('Task created.')
          setNewTitle('')
          setNewDesc('')
          setNewDueDate('')
          setNewAssignedTo(user?._id ?? '')
          setPanelOpen(false)
          load()
        } else {
          addToast((res as { message: string }).message ?? 'Failed', 'error')
        }
      })
      .finally(() => setSubmitting(false))
  }

  function handleStatusChange(task: Task, status: Task['status']): void {
    if (status === task.status) return
    tasksApi.update(task._id, { status }).then((res) => {
      if (res.success) {
        addToast('Task updated.')
        load()
      } else {
        addToast((res as { message: string }).message ?? 'Failed', 'error')
      }
    })
  }

  const totalPages = Math.ceil(total / limit) || 1

  const statusOptions = [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Done]

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
        <div className="w-full min-w-0 sm:max-w-xs">
          <Input
            type="search"
            placeholder="Search by title"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full"
          />
        </div>
        <Button variant="primary" className="w-full shrink-0 sm:w-auto sm:self-start" onClick={() => setPanelOpen(true)}>
          Create Task
        </Button>
      </div>

      <Card className="min-w-0 overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : (
          <>
            <DataTable<Task>
              columns={[
                { key: 'title', header: 'Title', render: (r) => r.title },
                { key: 'description', header: 'Description', render: (r) => r.description ?? '—' },
                { key: 'assignedTo', header: 'Assigned to', render: (r) => userLabel(r.assignedTo) },
                { key: 'dueDate', header: 'Due', render: (r) => formatDue(r.dueDate) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => (
                    <select
                      aria-label="Change task status"
                      className={selectClassName}
                      value={r.status}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleStatusChange(r, e.target.value as Task['status'])
                      }
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ),
                },
              ]}
              data={list}
              keyExtractor={(r) => r._id}
              emptyMessage="No tasks"
            />
            {totalPages > 1 && (
              <div className="border-t border-[var(--app-border)] p-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPrev={() => setPage((p) => Math.max(1, p - 1))}
                  onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </div>
            )}
          </>
        )}
      </Card>

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Create Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            value={newTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
            required
          />
          <Input
            label="Description"
            value={newDesc}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDesc(e.target.value)}
          />
          <div className="w-full">
            <label
              htmlFor="task-assignee"
              className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
            >
              Assign to <span className="text-red-500">*</span>
            </label>
            <select
              id="task-assignee"
              required
              className={`w-full ${selectClassName} px-3 py-2.5`}
              value={newAssignedTo}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewAssignedTo(e.target.value)}
            >
              {assignees.length === 0 ? (
                <option value="">Loading users…</option>
              ) : (
                assignees.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.fullName} ({u.role})
                  </option>
                ))
              )}
            </select>
            {assignees.length === 0 && (
              <p className="mt-1.5 font-body text-xs text-[var(--app-muted)]">
                No users loaded. You need at least one user in the company to assign tasks.
              </p>
            )}
          </div>
          <Input
            label="Due date (optional)"
            type="date"
            value={newDueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDueDate(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={submitting} disabled={assignees.length === 0}>
            Create
          </Button>
        </form>
      </SlidePanel>
    </div>
  )
}
