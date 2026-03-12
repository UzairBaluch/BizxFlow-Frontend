import { useCallback, useEffect, useState } from 'react'
import { users as usersApi } from '@/api/client'
import { useToast } from '@/context/ToastContext'
import type { User } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { DataTable, Pagination } from '@/components/ui/DataTable'

export function UsersPage(): React.ReactElement {
  const [list, setList] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)
    usersApi
      .all({ search: search || undefined, page, limit })
      .then((res) => {
        if (res.success && res.data) {
          setList(res.data.users ?? [])
          setTotal(res.data.totalUsers ?? 0)
        } else {
          addToast((res as { message: string }).message ?? 'Failed to load users', 'error')
        }
      })
      .finally(() => setLoading(false))
  }, [search, page, addToast])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="space-y-7">
      <div className="max-w-xs">
        <Input
          type="search"
          placeholder="Search by full name"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

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
                { key: 'role', header: 'Role', render: (u) => <span className="font-display text-[10px] font-semibold uppercase text-[var(--app-text)]">{u.role}</span> },
                { key: 'email', header: 'Email', render: (u) => u.email },
                { key: 'createdAt', header: 'Joined', render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—') },
              ]}
              data={list}
              keyExtractor={(u) => u._id}
              emptyMessage="No users"
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
