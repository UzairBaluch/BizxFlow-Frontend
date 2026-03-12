import { Card, CardTitle } from '@/components/ui/Card'
import { FileText } from 'lucide-react'

export function EndOfDayReportPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">End-of-Day Report</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Submit what you did today; AI compiles it for managers.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Daily report</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Every employee submits a short summary. Managers get an AI-compiled overview.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Report form and team summary will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
