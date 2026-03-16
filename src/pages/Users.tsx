import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { users as usersApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { User, Role } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DataTable, Pagination } from '@/components/ui/DataTable'

const ROLES: Role[] = ['Admin', 'Manager', 'Employee']

export function UsersPage(): React.ReactElement {
  const { accountType, user } = useAuth()
  const canListUsers = accountType === 'company' || (user && (user.role === 'Admin' || user.role === 'Manager'))
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
          setList(res.data.users ?? [])
          setTotal(res.data.totalUsers ?? 0)
        } else {
          const err = res as { message: string; status?: number }
          const msg = err.status === 403
            ? "You don't have permission to view users."
            : (err.message ?? 'Failed to load users')
          addToast(msg, 'error')
        }
      })
      .finally(() => setLoading(false))
  }, [canListUsers, search, page, addToast])

  useEffect(() => {
    if (canListUsers) load()
  }, [canListUsers, load])

  const totalPages = Math.ceil(total / limit) || 1

  if (!canListUsers) {
    return (
      <div className="space-y-7">
        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-[var(--app-text)]">Access restricted</h2>
          <p className="mt-2 font-body text-sm text-[var(--app-muted)]">
            Only company accounts and users with Admin or Manager role can view and manage company users.
          </p>
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
        err.status === 403
          ? "You don't have permission to add users."
          : err.status === 404
            ? 'Add user is not available on this server yet.'
            : (err.message ?? 'Failed to add user')
      addToast(msg, 'error')
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-lg font-bold text-[var(--app-text)] sm:text-xl">Company users</h2>
        <p className="mt-1 font-body text-sm text-[var(--app-muted)]">
          This list shows <strong>user accounts (employees)</strong> in your company—not your company account. You’re signed in as the company, so you won’t appear as a row here. Add employees with &quot;Add user&quot; and they will appear in this table.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xs">
          <Input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        {canAddUser && (
          <Button variant="primary" onClick={() => setAddModalOpen(true)}>
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
                <option key={r} value={r}>{r}</option>
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

      <Card className="overflow-hidden p-0">
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
                      {u.role}
                    </span>
                  ),
                },
                { key: 'email', header: 'Email', render: (u) => u.email },
                { key: 'createdAt', header: 'Joined', render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—') },
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
