import { Card, CardTitle } from '@/components/ui/Card'
import { Bell } from 'lucide-react'

export function NotificationsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Notifications</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Email alerts for every task, leave, and approval.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Instant notifications</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          In-app and email alerts so you never miss a task assignment, leave request, or mention.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Notification history and settings will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
