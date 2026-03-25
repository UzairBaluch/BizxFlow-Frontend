import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { users as usersApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { isManagerRole } from '@/lib/authAccess'
import type { User, Role } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTable, Pagination } from '@/components/ui/DataTable'

const ROLES: Role[] = ['Manager', 'Employee']

const selectClassName =
  'w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-text)] disabled:opacity-50'

function normalizeRoleValue(r: string | undefined): Role {
  if (r == null || r === '') return 'Employee'
  const x = r.trim().toLowerCase()
  if (x === 'admin' || x === 'manager') return 'Manager'
  return 'Employee'
}

function isUserMutationOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true) return true
  if (typeof r._httpStatus === 'number' && r._httpStatus >= 200 && r._httpStatus < 300) return true
  return false
}

export function UsersPage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const canListUsers = accountType === 'company' || (user != null && isManagerRole(user.role))
  /** Company or Manager — edit roles & delete users (except self-delete for user sessions). */
  const canManageDirectory = canListUsers
  const canAddUser = canListUsers
  const [list, setList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addFullName, setAddFullName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addRole, setAddRole] = useState<Role>('Employee')
  const [addPicture, setAddPicture] = useState<File | null>(null)
  const [addSubmitting, setAddSubmitting] = useState(false)
  /** User open in Edit modal (role + optional remove). */
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editRoleDraft, setEditRoleDraft] = useState<Role>('Employee')
  const [editSaving, setEditSaving] = useState(false)
  const [editDeleteSubmitting, setEditDeleteSubmitting] = useState(false)
  const [editDeleteConfirm, setEditDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 10
  const { addToast } = useToast()

  const load = useCallback(() => {
    if (!canListUsers) return
    setLoading(true)
    usersApi
      .all({ search: search || undefined, page, limit })
      .then((res) => {
        if (res.success && res.data) {
          const rows = (res.data.users ?? []).filter((row): row is User => row != null && row._id != null)
          setList(rows)
          setTotal(res.data.totalUsers ?? 0)
        } else {
          const err = res as { message: string; status?: number }
          const msg =
            err.status === 401
              ? 'Unauthorized. Please sign in again.'
              : err.status === 403
                ? "You don't have permission to view users."
                : (err.message ?? 'Failed to load users')
          addToast(msg, 'error')
        }
      })
      .finally(() => setLoading(false))
  }, [canListUsers, search, page, addToast])

  useEffect(() => {
    queueMicrotask(() => {
      if (canListUsers) void load()
    })
  }, [canListUsers, load])

  const totalPages = Math.ceil(total / limit) || 1

  const canDeleteUserRow = (target: User): boolean => {
    if (!canManageDirectory) return false
    if (accountType === 'user' && user?._id != null && target._id === user._id) return false
    return true
  }

  /** Backend rejects changing your own role when logged in as a user JWT (403). */
  const canChangeRoleForRow = (target: User): boolean => {
    if (!canManageDirectory) return false
    if (accountType === 'user' && user?._id != null && target._id === user._id) return false
    return true
  }

  function openEditUser(u: User): void {
    setEditUser(u)
    setEditRoleDraft(normalizeRoleValue(u.role))
    setEditDeleteConfirm(false)
  }

  function closeEditUser(): void {
    if (editSaving || editDeleteSubmitting) return
    setEditUser(null)
    setEditDeleteConfirm(false)
  }

  function handleSaveRoleFromEdit(): void {
    if (editUser == null || !canChangeRoleForRow(editUser)) return
    const current = normalizeRoleValue(editUser.role)
    if (editRoleDraft === current) {
      addToast('No role change to save.')
      return
    }
    setEditSaving(true)
    usersApi
      .updateRole(editUser._id, { role: editRoleDraft })
      .then((res) => {
        if (isUserMutationOk(res)) {
          addToast(`Role updated to ${editRoleDraft}.`)
          setEditUser((prev) => (prev && prev._id === editUser._id ? { ...prev, role: editRoleDraft } : prev))
          load()
        } else {
          const err = res as { message?: string; status?: number }
          addToast(err.message ?? 'Could not update role.', 'error')
        }
      })
      .catch(() => addToast('Could not update role.', 'error'))
      .finally(() => setEditSaving(false))
  }

  function handleConfirmDeleteFromEdit(): void {
    if (editUser == null || !canDeleteUserRow(editUser)) return
    setEditDeleteSubmitting(true)
    usersApi
      .deleteUser(editUser._id)
      .then((res) => {
        if (isUserMutationOk(res)) {
          addToast(`${editUser.fullName} removed from company.`)
          setEditUser(null)
          setEditDeleteConfirm(false)
          load()
        } else {
          const err = res as { message?: string; status?: number }
          addToast(err.message ?? 'Could not remove user.', 'error')
        }
      })
      .catch(() => addToast('Could not remove user.', 'error'))
      .finally(() => setEditDeleteSubmitting(false))
  }

  if (!canListUsers) {
    return (
      <div className="min-w-0 space-y-7">
        <Card className="min-w-0 p-6">
          <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Access restricted</h2>
          <Link to="/tasks" className="mt-4 inline-block font-body text-sm font-medium text-[var(--app-text)] underline hover:no-underline">
            Go to Tasks
          </Link>
        </Card>
      </div>
    )
  }

  async function handleAddUser(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!addFullName.trim() || !addEmail.trim() || !addPassword) {
      addToast('Fill in full name, email, and password.', 'error')
      return
    }
    setAddSubmitting(true)
    const res = await usersApi.addUser(
      { fullName: addFullName.trim(), email: addEmail.trim(), password: addPassword, role: addRole },
      addPicture ?? undefined
    )
    setAddSubmitting(false)
    if (res.success) {
      addToast('User added successfully.')
      setAddModalOpen(false)
      setAddFullName('')
      setAddEmail('')
      setAddPassword('')
      setAddRole('Employee')
      setAddPicture(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      load()
    } else {
      const err = res as { message: string; status?: number }
      const msg =
        err.status === 401
          ? 'Unauthorized. Please sign in again.'
          : err.status === 403
            ? "You don't have permission to add users."
            : err.status === 404
              ? 'Add user is not available on this server yet.'
              : err.status === 409
                ? err.message ?? 'User already exists.'
                : (err.message ?? 'Failed to add user')
      addToast(msg, 'error')
    }
  }

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold text-[var(--app-text)] sm:text-xl">Company users</h2>
        <p className="mt-1 font-body text-sm text-[var(--app-muted)]">
          {canManageDirectory
            ? 'Use Edit on a row to change role or remove a user. While signed in as a team user, you cannot change your own role or remove your own account.'
            : 'Directory of users in your organization.'}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
        <div className="w-full min-w-0 sm:max-w-xs">
          <Input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full"
          />
        </div>
        {canAddUser && (
          <Button variant="primary" className="w-full shrink-0 sm:w-auto sm:self-start" onClick={() => setAddModalOpen(true)}>
            Add user
          </Button>
        )}
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add user to company">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Full name"
            required
            value={addFullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddFullName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            value={addEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={addPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddPassword(e.target.value)}
          />
          <div className="w-full">
            <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]">
              Role
            </label>
            <select
              value={addRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAddRole(e.target.value as Role)}
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] outline-none transition focus:border-[var(--app-text)]"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]">
              Picture (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] file:mr-2 file:rounded file:border-0 file:bg-[var(--app-text)] file:px-3 file:py-1 file:text-[var(--app-bg)] file:text-sm"
              onChange={(e) => setAddPicture(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" loading={addSubmitting} disabled={addSubmitting}>
              Add user
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editUser != null} onClose={closeEditUser} title="Edit user" className="max-w-[440px]">
        {editUser != null && (
          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-4">
              <p className="font-body text-sm font-medium text-[var(--app-text)]">{editUser.fullName}</p>
              <p className="mt-0.5 font-body text-sm text-[var(--app-muted)]">{editUser.email}</p>
            </div>

            <div>
              <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Role
              </h3>
              {canChangeRoleForRow(editUser) ? (
                <>
                  <select
                    aria-label="User role"
                    className={selectClassName}
                    value={editRoleDraft}
                    disabled={editSaving}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditRoleDraft(e.target.value as Role)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={editSaving}
                      disabled={editSaving || editRoleDraft === normalizeRoleValue(editUser.role)}
                      onClick={handleSaveRoleFromEdit}
                    >
                      Save role
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-body text-sm text-[var(--app-text)]">
                    {normalizeRoleValue(editUser.role)}
                  </p>
                  <p className="mt-2 font-body text-sm text-[var(--app-muted)]">
                    You can&apos;t change your own role while signed in as this account.
                  </p>
                </>
              )}
            </div>

            <div className="border-t border-[var(--app-border)] pt-5">
              <h3 className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)]">
                Remove user
              </h3>
              {canDeleteUserRow(editUser) ? (
                editDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="font-body text-sm text-[var(--app-text)]">
                      Remove <span className="font-semibold">{editUser.fullName}</span> from the company? They will lose access
                      to this workspace.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={editDeleteSubmitting}
                        disabled={editDeleteSubmitting}
                        onClick={handleConfirmDeleteFromEdit}
                      >
                        Yes, remove user
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={editDeleteSubmitting}
                        onClick={() => setEditDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setEditDeleteConfirm(true)}>
                    Remove from company…
                  </Button>
                )
              ) : (
                <p className="font-body text-sm text-[var(--app-muted)]">
                  You can&apos;t remove your own account while signed in as this user.
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-[var(--app-border)] pt-4">
              <Button variant="ghost" size="sm" disabled={editSaving || editDeleteSubmitting} onClick={closeEditUser}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Card className="min-w-0 overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : (
          <>
            <DataTable<User>
              columns={[
                {
                  key: 'fullName',
                  header: 'User',
                  render: (u) => (
                    <div className="flex items-center gap-3">
                      {u.profilePicture ? (
                        <img
                          src={u.profilePicture}
                          alt=""
                          className="h-9 w-9 rounded-full border border-[var(--app-border)] object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-border)] font-body text-xs font-medium text-[var(--app-muted)]">
                          {(u.fullName ?? '?').charAt(0)}
                        </div>
                      )}
                      <span className="font-body text-sm font-medium text-[var(--app-text)]">{u.fullName}</span>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (u) => (
                    <span className="inline-flex items-center rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-0.5 font-body text-xs font-medium uppercase tracking-wider text-[var(--app-text)]">
                      {u.role ?? '—'}
                    </span>
                  ),
                },
                { key: 'email', header: 'Email', render: (u) => u.email },
                {
                  key: 'createdAt',
                  header: 'Joined',
                  render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
                },
                ...(canManageDirectory
                  ? [
                      {
                        key: '_actions',
                        header: 'Actions',
                        render: (u: User) => (
                          <Button size="sm" variant="secondary" onClick={() => openEditUser(u)}>
                            Edit
                          </Button>
                        ),
                      },
                    ]
                  : []),
              ]}
              data={list}
              keyExtractor={(u) => u._id}
              emptyMessage="No users in your company yet. Add one above."
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
    </div>
  )
}
