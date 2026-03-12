import { Card, CardTitle } from '@/components/ui/Card'
import { MessageCircle } from 'lucide-react'

export function ChatPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-[var(--app-text)]">Team Chat</h1>
          <p className="font-body text-sm text-[var(--app-muted)]">Real-time messaging with channels per team or department.</p>
        </div>
      </div>
      <Card className="p-8">
        <CardTitle className="mb-2">Channels & DMs</CardTitle>
        <p className="font-body text-sm text-[var(--app-muted)]">
          Stay in sync without leaving the app. Create channels for projects or departments and message anyone directly.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/50 p-8 text-center">
          <p className="font-body text-sm text-[var(--app-muted)]">Channel list and chat view will appear here.</p>
        </div>
      </Card>
    </div>
  )
}
