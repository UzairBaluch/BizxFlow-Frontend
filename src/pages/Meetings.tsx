import { Card, CardTitle } from '@/components/ui/Card'
import { Video } from 'lucide-react'

export function MeetingsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Meetings</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Schedule, join, and track team meetings with automatic reminders.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Meeting scheduler & notes</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Book and manage team syncs. Join from the app or your calendar. AI summarizes meetings into action items.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Meeting list and calendar view will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
