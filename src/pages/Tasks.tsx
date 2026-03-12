import { useCallback, useEffect, useState } from 'react'
import { tasks as tasksApi } from '@/api/client'
import { useToast } from '@/context/ToastContext'
import type { Task } from '@/types/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable, Pagination } from '@/components/ui/DataTable'
import { SlidePanel } from '@/components/ui/SlidePanel'

export function TasksPage(): React.ReactElement {
  const [list, setList] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const [panelOpen, setPanelOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
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

  function handleCreate(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSubmitting(true)
    tasksApi
      .create({ title: newTitle.trim(), description: newDesc.trim() })
      .then((res) => {
        if (res.success) {
          addToast('Task created.')
          setNewTitle('')
          setNewDesc('')
          setPanelOpen(false)
          load()
        } else {
          addToast((res as { message: string }).message ?? 'Failed', 'error')
        }
      })
      .finally(() => setSubmitting(false))
  }

  const totalPages = Math.ceil(total / limit) || 1

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Search by title"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Button variant="primary" onClick={() => setPanelOpen(true)}>
          Create Task
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
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
                { key: 'status', header: 'Status', render: (r) => String(r.status).replace('-', ' ') },
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
          <Button type="submit" variant="primary" loading={submitting}>
            Create
          </Button>
        </form>
      </SlidePanel>
    </div>
  )
}
