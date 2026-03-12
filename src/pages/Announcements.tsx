import { Card, CardTitle } from '@/components/ui/Card'
import { Megaphone } from 'lucide-react'

export function AnnouncementsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Announcements</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Broadcast company-wide updates from Admin in one place.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Company announcements</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Post updates that reach the whole team. Admins can publish; everyone can read.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Announcement list and composer will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
