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

/**
 * User ref from API (assignee, creator). Backend may populate `fullName`, or only `email` / `name`,
 * or nest under `user` — avoid showing "—" when any display field exists.
 */
function userLabel(ref: string | User | Record<string, unknown> | undefined | null): string {
  if (ref == null || ref === '') return '—'
  if (typeof ref === 'string') {
    const t = ref.trim()
    return t.length > 0 ? t : '—'
  }
  if (typeof ref === 'object' && ref !== null) {
    const o = ref as Record<string, unknown>
    const fullName = o.fullName
    if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
    const name = o.name
    if (typeof name === 'string' && name.trim()) return name.trim()
    const email = o.email
    if (typeof email === 'string' && email.trim()) return email.trim()
    const nested = o.user
    if (nested != null && typeof nested === 'object') {
      const fromNested = userLabel(nested as Record<string, unknown>)
      if (fromNested !== '—') return fromNested
    }
    return '—'
  }
  return '—'
}

/** Prefer populated `createdBy`; some payloads use alternate keys. */
function createdByLabel(task: Task): string {
  const raw = task.createdBy as unknown
  const fromMain = userLabel(raw as Record<string, unknown>)
  if (fromMain !== '—') return fromMain
  const t = task as Record<string, unknown>
  const alt = t.creator ?? t.createdByUser
  if (alt != null) return userLabel(alt as Record<string, unknown>)
  return '—'
}

function assigneeId(task: Task): string {
  const a = task.assignedTo
  if (typeof a === 'object' && a && '_id' in a) return (a as User)._id
  return String(a ?? '')
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

/** Human-readable message from API error envelopes. */
function getApiMessage(res: unknown): string | undefined {
  if (res == null || typeof res !== 'object') return undefined
  const r = res as Record<string, unknown>
  if (typeof r.message === 'string' && r.message.trim()) return r.message
  if (typeof r.error === 'string' && r.error.trim()) return r.error
  const errors = r.errors
  if (Array.isArray(errors) && errors[0] != null && typeof errors[0] === 'object') {
    const e0 = errors[0] as Record<string, unknown>
    if (typeof e0.message === 'string') return e0.message
  }
  return undefined
}

/** HTTP status attached by `apiRequest` on 2xx responses (not from API JSON). */
function httpStatusOf(res: unknown): number | undefined {
  if (res == null || typeof res !== 'object') return undefined
  const n = (res as { _httpStatus?: unknown })._httpStatus
  return typeof n === 'number' ? n : undefined
}

/**
 * POST /tasks success shapes we accept (BizxFlow + common variants).
 * Failing to recognize a real 200/201 body left the UI stuck or showed "Failed" while the task existed.
 */
function isTaskCreateOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true || r.success === 'true') return true
  const http = httpStatusOf(res)
  if (http === 200 || http === 201) {
    // Created at HTTP layer — accept unless body explicitly failed
    return true
  }
  if (r.data != null && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>
    if (d.task != null) return true
    if (typeof d._id === 'string' || typeof d.id === 'string') return true
    if (d._id != null && typeof d._id === 'object' && '$oid' in (d._id as object)) return true
    const inner = d.data
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) {
      const di = inner as Record<string, unknown>
      if (di.task != null) return true
      if (typeof di._id === 'string' && typeof di.title === 'string') return true
    }
  }
  if (r.task != null && typeof r.task === 'object') return true
  if (typeof r._id === 'string' && typeof r.title === 'string') return true
  if (Array.isArray(r.tasks) && r.tasks[0] != null && typeof r.tasks[0] === 'object') return true
  return false
}

/** Single task from POST body so we can show it immediately if GET list lags or shape differs. */
function extractTaskFromCreateResponse(res: unknown): Task | null {
  if (res == null || typeof res !== 'object') return null
  const r = res as Record<string, unknown>
  let cand: unknown
  if (r.task != null) cand = r.task
  else if (Array.isArray(r.tasks) && r.tasks[0] != null) cand = r.tasks[0]
  else if (r.data != null && typeof r.data === 'object') {
    const d = r.data as Record<string, unknown>
    if (d.task != null) cand = d.task
    else if (d.data != null && typeof d.data === 'object' && !Array.isArray(d.data)) {
      const inner = d.data as Record<string, unknown>
      cand = inner.task ?? inner
    } else cand = d.task ?? d
  } else if (typeof r._id === 'string' || typeof r.id === 'string') cand = r
  if (cand == null || typeof cand !== 'object') return null
  return normalizeTasksFromApi([cand as Task])[0] ?? null
}

function isTaskListOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true) return true
  if (r.data != null) return true
  if (Array.isArray(r.tasks)) return true
  if (Array.isArray(r.items)) return true
  if (Array.isArray(r.results)) return true
  return false
}

/** Pull task array from common API shapes (including nested `data`). */
function extractTasksArray(o: Record<string, unknown>): Task[] {
  const tryKeys = ['tasks', 'items', 'results', 'data'] as const
  for (const key of tryKeys) {
    const v = o[key]
    if (Array.isArray(v)) return v as Task[]
    if (v != null && typeof v === 'object' && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>
      if (Array.isArray(inner.tasks)) return inner.tasks as Task[]
      if (Array.isArray(inner.items)) return inner.items as Task[]
    }
  }
  return []
}

function parseTasksListPayload(data: unknown): { tasks: Task[]; total: number } {
  if (data == null) return { tasks: [], total: 0 }
  if (Array.isArray(data)) return { tasks: data as Task[], total: data.length }
  if (typeof data !== 'object') return { tasks: [], total: 0 }
  const o = data as Record<string, unknown>
  let tasks = extractTasksArray(o)
  if (tasks.length === 0 && Array.isArray(o.data)) {
    tasks = o.data as Task[]
  }
  const total =
    typeof o.totalTasks === 'number'
      ? o.totalTasks
      : typeof o.total === 'number'
        ? o.total
        : typeof o.count === 'number'
          ? o.count
          : typeof o.totalCount === 'number'
            ? o.totalCount
            : tasks.length
  return { tasks, total }
}

/** Mongo / REST often use `id` or `{ $oid }`; our table needs string `_id` for keys. */
function normalizeTasksFromApi(tasks: Task[]): Task[] {
  return tasks
    .map((raw) => {
      if (raw == null || typeof raw !== 'object') return null
      const t = raw as Record<string, unknown>
      let _id: string | null =
        typeof t._id === 'string' ? t._id : typeof t.id === 'string' ? t.id : null
      if (_id == null && t._id != null && typeof t._id === 'object' && '$oid' in (t._id as object)) {
        _id = String((t._id as { $oid: string }).$oid)
      }
      if (_id == null || _id === '') return null
      return { ...raw, _id } as Task
    })
    .filter((t): t is Task => t != null)
}

export function TasksPage(): React.ReactElement {
  const { user, accountType, token, loading: authLoading } = useAuth()
  /** GET /tasks — everyone signed in as a user can list; company account too. Tenant scope is inferred from JWT on the server (do not send `scope=all` unless your API documents it — production returned 401). */
  const canListTasks = (accountType === 'user' && !!user) || accountType === 'company'
  /** POST /tasks — company or Admin/Manager user. */
  const canCreateTasks =
    accountType === 'company' || user?.role === 'Admin' || user?.role === 'Manager'
  /** Tenant-wide task list (same idea as company dashboard): company JWT or Admin/Manager user. */
  const seesCompanyWideTaskList =
    accountType === 'company' || user?.role === 'Admin' || user?.role === 'Manager'

  const [list, setList] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  /** GET /all-tasks only — Pending | In Progress | Done; empty = no filter */
  const [statusFilter, setStatusFilter] = useState<'' | Task['status']>('')
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
    if (!canListTasks) {
      setList([])
      setTotal(0)
      setLoading(false)
      return
    }
    if (authLoading || !token) {
      setLoading(authLoading)
      return
    }
    setLoading(true)
    const listParams = { search: search || undefined, page, limit }
    const allParams =
      statusFilter !== ''
        ? { ...listParams, status: statusFilter }
        : listParams

    /**
     * GET /all-tasks: company + Admin/Manager (tenant-wide, optional status filter).
     * GET /tasks: assignee-scoped ("my tasks") for Employees and fallback.
     */
    const fetchTasks = async (): Promise<unknown> => {
      if (!seesCompanyWideTaskList) {
        return tasksApi.list(listParams)
      }
      const wide = await tasksApi.all(allParams)
      if (isTaskListOk(wide)) return wide
      const st = (wide as { status?: number }).status
      if (st === 404 || st === 403 || st === 501) {
        return tasksApi.list(listParams)
      }
      return wide
    }

    void fetchTasks()
      .then((res) => {
        if (!isTaskListOk(res)) {
          const err = res as { message?: string; status?: number }
          const msg =
            err.status === 401
              ? 'Session expired or not signed in. Please sign in again.'
              : err.message
          if (msg) addToast(msg, 'error')
          setList([])
          setTotal(0)
          return
        }
        const r = res as Record<string, unknown>
        const raw = r.data !== undefined && r.data !== null ? r.data : res
        const { tasks, total } = parseTasksListPayload(raw)
        setList(normalizeTasksFromApi(tasks))
        setTotal(total)
      })
      .catch(() => {
        addToast('Could not load tasks.', 'error')
        setList([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [canListTasks, authLoading, token, search, page, addToast, seesCompanyWideTaskList, statusFilter])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  /** Load users for assignee picker (create task). */
  useEffect(() => {
    if (!panelOpen || !canCreateTasks) return
    usersApi.all({ page: 1, limit: 100 }).then((res) => {
      const raw = res.success && res.data?.users?.length ? res.data.users : []
      const people = raw.filter((u): u is User => u != null && u._id != null)
      if (people.length > 0) {
        setAssignees(people)
        setNewAssignedTo((prev) =>
          prev || (user?._id && people.some((u) => u._id === user._id) ? user._id : people[0]!._id)
        )
      } else if (user) {
        setAssignees([user])
        setNewAssignedTo(user._id)
      } else {
        setAssignees([])
        setNewAssignedTo('')
      }
    })
  }, [panelOpen, user, canCreateTasks])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
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
    try {
      const res = await tasksApi.create({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        assignedTo: newAssignedTo,
        ...(newDueDate ? { dueDate: `${newDueDate}T12:00:00.000Z` } : {}),
      })
      if (!isTaskCreateOk(res)) {
        addToast(getApiMessage(res) ?? 'Failed to create task', 'error')
        return
      }
      addToast('Task created.')
      setNewTitle('')
      setNewDesc('')
      setNewDueDate('')
      setNewAssignedTo(user?._id ?? assignees[0]?._id ?? '')
      setPanelOpen(false)
      const created = extractTaskFromCreateResponse(res)
      if (created) {
        setList((prev) => (prev.some((p) => p._id === created._id) ? prev : [created, ...prev]))
      }
      void load()
    } catch {
      addToast('Could not create task. Check your connection.', 'error')
    } finally {
      setSubmitting(false)
    }
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

  const canEditStatus = (task: Task): boolean =>
    !!user && assigneeId(task) === user._id

  const taskColumns = [
    { key: 'title', header: 'Title', render: (r: Task) => r.title },
    { key: 'description', header: 'Description', render: (r: Task) => r.description ?? '—' },
    { key: 'assignedTo', header: 'Assigned to', render: (r: Task) => userLabel(r.assignedTo) },
    ...(seesCompanyWideTaskList
      ? [{ key: 'createdBy', header: 'Created by', render: (r: Task) => createdByLabel(r) }]
      : []),
    { key: 'dueDate', header: 'Due', render: (r: Task) => formatDue(r.dueDate) },
    {
      key: 'status',
      header: 'Status',
      render: (r: Task) =>
        canEditStatus(r) ? (
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
        ) : (
          <span className="font-body text-sm text-[var(--app-text)]">{r.status}</span>
        ),
    },
  ]

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      {(canListTasks || canCreateTasks) && (
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
          {canListTasks && (
            <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
              {seesCompanyWideTaskList && (
                <div className="w-full min-w-0 sm:w-auto sm:min-w-[11rem]">
                  <label
                    htmlFor="task-status-filter"
                    className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
                  >
                    Status
                  </label>
                  <select
                    id="task-status-filter"
                    className={`w-full ${selectClassName} px-3 py-2.5`}
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const v = e.target.value
                      setStatusFilter(v === '' ? '' : (v as Task['status']))
                      setPage(1)
                    }}
                  >
                    <option value="">All statuses</option>
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {canCreateTasks && (
            <Button variant="primary" className="w-full shrink-0 sm:w-auto sm:self-start" onClick={() => setPanelOpen(true)}>
              Create Task
            </Button>
          )}
        </div>
      )}

      {canListTasks && (
        <Card className="min-w-0 overflow-hidden p-0">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
            </div>
          ) : (
            <>
              <DataTable<Task>
                columns={taskColumns}
                data={list}
                keyExtractor={(r) => r._id}
                emptyMessage={seesCompanyWideTaskList ? 'No tasks yet' : 'No tasks assigned to you'}
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
      )}

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
                    {u.fullName ?? '—'} ({u.role ?? '—'})
                  </option>
                ))
              )}
            </select>
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
