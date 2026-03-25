import { ChevronDown } from 'lucide-react'

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
    a: 'Yes. Your company account or managers can add users via the “Add user” flow. Each employee is associated with your company.',
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

export function FaqSection(): React.ReactElement {
  return (
    <section className="border-t border-[var(--app-border)] bg-[var(--app-card)]/30 px-3 py-12 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]">FAQ</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Frequently asked questions</h2>

        {/* Mobile/Tablet: click-to-expand */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:hidden">
          {FAQ_ITEMS.map((item, i) => {
            // Bento-ish width variation on sm+ (since lg+ is hidden in this block).
            const bentoSpan = i === 0 || i === 3 ? 'sm:col-span-2' : 'sm:col-span-1'
            return (
              <div
                key={item.q}
                className={`landing-card-hover rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition-shadow ${bentoSpan}`}
              >
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-body text-sm font-semibold text-[var(--app-text)]">
                    <span className="pt-0.5">{item.q}</span>
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--app-muted)] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 font-body text-sm text-[var(--app-muted)] leading-relaxed">{item.a}</p>
                </details>
              </div>
            )
          })}
        </div>

        {/* Desktop: always open (no click needed) */}
        <div className="hidden lg:block mt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:auto-rows-auto">
            {FAQ_ITEMS.map((item, i) => {
              const bentoSpan = i === 0 || i === 3 ? 'lg:col-span-2' : 'lg:col-span-1'
              return (
                <div
                  key={item.q}
                  className={`landing-card-hover rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 transition-shadow ${bentoSpan}`}
                >
                  <h3 className="font-body text-sm font-semibold text-[var(--app-text)]">{item.q}</h3>
                  <p className="mt-2 font-body text-sm text-[var(--app-muted)] leading-relaxed">{item.a}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

