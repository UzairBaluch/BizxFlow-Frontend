import { Modal } from '@/components/ui/Modal'
import { ChevronDown } from 'lucide-react'

type FaqModalProps = {
  open: boolean
  onClose: () => void
}

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'What is BizxFlow?',
    a: 'BizxFlow is a workforce app for projects, meetings, attendance, tasks, leave approvals, and more—all in one place.',
  },
  {
    q: 'How does company signup work?',
    a: 'Companies sign up via “Get started” (register). That creates your company account. Employees are added afterwards.',
  },
  {
    q: 'Can I add employees to my company?',
    a: 'Yes. Company admins/managers can add users via the “Add user” flow. Each employee is associated with your company.',
  },
  {
    q: 'How does attendance check-in/check-out work?',
    a: 'Employees can check in and check out. The system stores attendance records per company so teams only see their own data.',
  },
  {
    q: 'Is my data separated between companies?',
    a: 'Yes. Attendance and other company-wide lists are scoped to your company (multi-tenancy using companyId).',
  },
  {
    q: 'Where can I find API docs?',
    a: 'Use the “API Docs” link in the header (it opens Swagger).',
  },
]

export function FaqModal({ open, onClose }: FaqModalProps): React.ReactElement {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Frequently Asked Questions"
      className="w-full max-w-[720px] p-4 max-h-[85vh] overflow-y-auto sm:p-5"
    >
      <div className="space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-4 py-3"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-body text-sm font-semibold text-[var(--app-text)]">
              <span className="pt-0.5">{item.q}</span>
              <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-muted)] transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 font-body text-sm text-[var(--app-muted)] leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </Modal>
  )
}

