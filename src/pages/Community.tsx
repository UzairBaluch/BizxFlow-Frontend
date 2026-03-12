import { Card, CardTitle } from '@/components/ui/Card'
import { Newspaper } from 'lucide-react'

export function CommunityPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Newspaper className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Community Posts</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Employees and teams can post updates, share ideas, and have a shared feed.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Team feed</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Post updates, share wins, and keep the whole team in the loop in one place.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Community feed and new post form will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
