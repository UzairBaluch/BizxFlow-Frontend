import { Card, CardTitle } from '@/components/ui/Card'
import { Sunrise } from 'lucide-react'

export function BriefingPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <Sunrise className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">AI Daily Briefing</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Your team's day summarized in plain English, every morning.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Today's briefing</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Get a concise summary of tasks, leave, attendance, and updates so standups stay short and useful.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Briefing content will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
