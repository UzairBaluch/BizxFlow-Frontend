import { Card, CardTitle } from '@/components/ui/Card'
import { Smile } from 'lucide-react'

export function MoodCheckInPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Smile className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Mood Check-in</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Employees rate their day anonymously; managers see team morale trends.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Daily mood</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Submit how you're feeling. Managers get aggregated trends to support the team.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Mood picker and team trends will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
