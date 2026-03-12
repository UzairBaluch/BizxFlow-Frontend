import { Card, CardTitle } from '@/components/ui/Card'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Performance Insights</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Auto-scored employee performance based on real activity.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Analytics & reports</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Dashboards, charts, and performance scores. See how your team is doing at a glance.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Charts and performance metrics will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
