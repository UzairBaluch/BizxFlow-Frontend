import { useCallback, useEffect, useState } from 'react'
import { announcements as announcementsApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { isManagerRole } from '@/lib/authAccess'
import { useToast } from '@/context/ToastContext'
import type { Announcement } from '@/types/api'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Megaphone } from 'lucide-react'

function parseAnnouncementsPayload(data: unknown): Announcement[] {
  if (Array.isArray(data)) return data as Announcement[]
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (Array.isArray(o.announcements)) return o.announcements as Announcement[]
    if (Array.isArray(o.data)) return o.data as Announcement[]
  }
  return []
}

export function AnnouncementsPage(): React.ReactElement {
  const { user, accountType } = useAuth()
  const { addToast } = useToast()
  const canCreate =
    accountType === 'company' || isManagerRole(user?.role)

  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    announcementsApi
      .list()
      .then((res) => {
        if (res.success && res.data != null) {
          setList(parseAnnouncementsPayload(res.data))
        } else {
          setList([])
          if (!res.success) addToast(res.message ?? 'Failed to load announcements', 'error')
        }
      })
      .finally(() => setLoading(false))
  }, [addToast])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  async function handleCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      addToast('Title and body are required.', 'error')
      return
    }
    setSubmitting(true)
    const res = await announcementsApi.create({ title: title.trim(), body: body.trim() })
    setSubmitting(false)
    if (res.success) {
      addToast('Announcement published.')
      setTitle('')
      setBody('')
      load()
    } else {
      addToast((res as { message: string }).message ?? 'Failed to publish', 'error')
    }
  }

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Megaphone className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Announcements</h1>
        </div>
      </div>

      {canCreate && (
        <Card className="min-w-0 p-4 sm:p-5">
          <CardTitle className="mb-3">New announcement</CardTitle>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
            />
            <div className="w-full">
              <label className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] outline-none transition focus:border-[var(--app-text)]"
              />
            </div>
            <Button type="submit" variant="primary" loading={submitting}>
              Publish
            </Button>
          </form>
        </Card>
      )}

      <Card className="min-w-0 p-4 sm:p-5">
        <CardTitle className="mb-3 sm:mb-4">All announcements</CardTitle>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        ) : list.length === 0 ? (
          <p className="font-body text-sm text-[var(--app-muted)]">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((a) => (
              <li key={a._id} className="border-b border-[var(--app-border)] pb-4 last:border-0 last:pb-0">
                <h3 className="font-display text-base font-semibold text-[var(--app-text)]">{a.title}</h3>
                {a.createdAt && (
                  <p className="mt-0.5 font-body text-xs text-[var(--app-muted)]">
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap font-body text-sm text-[var(--app-text)]">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
