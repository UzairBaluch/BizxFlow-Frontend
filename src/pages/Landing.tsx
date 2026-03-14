import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video,
  MessageCircle,
  Bell,
  BarChart3,
  Clock,
  CheckSquare,
  Calendar,
  Shield,
  Moon,
  Sun,
  Check,
  Sparkles,
  Sunrise,
  MessageSquare,
  LayoutDashboard,
  Search,
  Lock,
  Megaphone,
  Smile,
  Scale,
  FileText,
  Menu,
  X,
  Star,
  Newspaper,
} from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'

const API_DOCS = 'https://bizxflow-production.up.railway.app/api-docs'

const DEMO_STATS = [
  { value: '12k+', label: 'Check-ins this month' },
  { value: '98%', label: 'On-time attendance' },
  { value: '2.4k', label: 'Tasks completed' },
  { value: '340', label: 'Leave requests handled' },
]

/** Hero feature highlights — shown as pills below subtext */
const HERO_FEATURES = [
  { label: 'Projects & tasks', icon: CheckSquare },
  { label: 'Meetings & notes', icon: Video },
  { label: 'Team chat', icon: MessageCircle },
  { label: 'AI daily briefing', icon: Sunrise },
  { label: 'Smart attendance', icon: Clock },
  { label: 'Leave approvals', icon: Calendar },
  { label: 'Performance insights', icon: BarChart3 },
  { label: 'Secure by default', icon: Lock },
  { label: 'Community posts', icon: Newspaper },
]

/** Core features — bento grid: 3 columns, asymmetric layout */
const CORE_FEATURES = [
  {
    id: 'meetings',
    title: 'Meeting Scheduler & Notes',
    description: 'Book, manage, and track team meetings with automatic reminders. AI summarizes your meeting into action items automatically.',
    icon: Video,
    span: 'sm:col-span-1 sm:row-span-2',
  },
  {
    id: 'team-chat',
    title: 'Team Chat',
    description: 'Real-time messaging with channels per team or department.',
    icon: MessageCircle,
    span: 'sm:col-span-1',
  },
  {
    id: 'ai-briefing',
    title: 'AI Daily Briefing',
    description: "Your team's day summarized in plain English, every morning.",
    icon: Sunrise,
    span: 'sm:col-span-1',
  },
  {
    id: 'notifications',
    title: 'Instant Notifications',
    description: 'Email alerts for every task, leave, and approval.',
    icon: Bell,
    span: 'sm:col-span-1',
  },
  {
    id: 'performance',
    title: 'Performance Insights',
    description: 'Auto-scored employee performance based on real activity.',
    icon: BarChart3,
    span: 'sm:col-span-2',
  },
  {
    id: 'community-posts',
    title: 'Community Posts',
    description: 'Employees and teams can post updates, share ideas, and have a shared feed in one place.',
    icon: Newspaper,
    span: 'sm:col-span-2',
  },
]

/** All product features — bento grid (span = larger card on sm+) */
const ALL_FEATURES = [
  { title: 'Smart Attendance', description: 'Clock in, clock out, auto-flagged anomalies.', icon: Clock, span: 'sm:col-span-2' },
  { title: 'Task Management', description: 'Assign, track, and close tasks across your team.', icon: CheckSquare, span: 'sm:col-span-2' },
  { title: 'Leave Approvals', description: 'Request, approve, or reject in one click.', icon: Calendar, span: '' },
  { title: 'AI Daily Briefing', description: "Your team's day summarized in plain English, every morning.", icon: Sunrise, span: '' },
  { title: 'Natural Language Tasks', description: 'Type "remind Ahmed to submit report by Friday" and it\'s done.', icon: MessageSquare, span: '' },
  { title: 'Performance Insights', description: 'Auto-scored employee performance based on real activity.', icon: BarChart3, span: '' },
  { title: 'Role-Based Access', description: 'Admins, Managers, and Employees each see exactly what they need.', icon: Shield, span: 'sm:col-span-2' },
  { title: 'Instant Notifications', description: 'Email alerts for every task, leave, and approval.', icon: Bell, span: '' },
  { title: 'Team Dashboard', description: 'Everything that matters, in one view.', icon: LayoutDashboard, span: '' },
  { title: 'Powerful Search', description: 'Find any employee, task, or record instantly.', icon: Search, span: '' },
  { title: 'Secure by Default', description: 'JWT auth, refresh tokens, rate limiting, and HTTP-only cookies.', icon: Lock, span: 'sm:col-span-2' },
  { title: 'Team Chat', description: 'Real-time messaging with channels per team or department.', icon: MessageCircle, span: '' },
  { title: 'Meeting Scheduler', description: 'Book, manage, and track team meetings with automatic reminders.', icon: Video, span: '' },
  { title: 'Meeting Notes', description: 'AI summarizes your meeting into action items automatically.', icon: FileText, span: '' },
  { title: 'Announcements', description: 'Broadcast company-wide updates from Admin in one place.', icon: Megaphone, span: '' },
  { title: 'Community Posts', description: 'Employees and teams can post updates, share ideas, and have a shared feed.', icon: Newspaper, span: 'sm:col-span-2' },
  { title: 'Mood Check-in', description: 'Employees rate their day anonymously, managers see team morale trends.', icon: Smile, span: '' },
  { title: 'AI Workload Balancer', description: 'Flags when one employee is overloaded compared to the rest of the team.', icon: Scale, span: 'sm:col-span-2' },
  { title: 'End-of-Day Report', description: 'Every employee submits what they did today, AI compiles it for managers.', icon: FileText, span: '' },
]

/** Client reviews — bento (span = wider/taller card) */
const CLIENT_REVIEWS = [
  { name: 'Sarah Chen', role: 'Head of Ops, TechFlow', quote: 'Attendance and leave in one place. We cut admin time by half.', rating: 5, span: 'sm:col-span-2' },
  { name: 'Marcus Webb', role: 'HR Manager, ScaleUp', quote: 'The AI briefing is a game-changer. Our standups are actually useful now.', rating: 5, span: '' },
  { name: 'Priya Patel', role: 'CTO, DevHouse', quote: 'Clean API, fast setup. We were live in a week.', rating: 5, span: '' },
  { name: 'James Okonkwo', role: 'COO, AfriTech', quote: 'Leave approvals used to take days. Now it\'s same-day. Huge for remote teams.', rating: 5, span: '' },
  { name: 'Elena Vasquez', role: 'People Lead, Nodo', quote: 'Mood check-ins gave us visibility we never had. We act on morale before it becomes a problem.', rating: 5, span: 'sm:col-span-2' },
  { name: 'David Kim', role: 'Eng Manager, StackLabs', quote: 'Natural language tasks are magic. "Remind Maria about the deploy" — done.', rating: 5, span: '' },
  { name: 'Nina Foster', role: 'HR Director, GreenBase', quote: 'Performance insights are fair and data-driven. No more guesswork in reviews.', rating: 5, span: '' },
]

/** Community posts — bento (span for featured/larger) */
const COMMUNITY_POSTS = [
  { title: 'How we cut standup time by 40% with AI briefings', author: 'TechFlow', date: 'Mar 10', category: 'Product', excerpt: 'Our team tried the daily briefing for two weeks. Here’s what changed.', span: 'sm:col-span-2' },
  { title: 'Setting up role-based access in 15 minutes', author: 'BizxFlow', date: 'Mar 8', category: 'Guide', excerpt: 'Step-by-step: Admin, Manager, and Employee roles with the right permissions.', span: '' },
  { title: 'Why we moved from spreadsheets to BizxFlow', author: 'ScaleUp', date: 'Mar 5', category: 'Story', excerpt: 'HR was drowning in sheets. One platform fixed it.', span: '' },
  { title: 'API tips: webhooks for leave and tasks', author: 'DevHouse', date: 'Mar 3', category: 'Technical', excerpt: 'Sync leave and tasks into your own tools with a few endpoints.', span: 'sm:col-span-2' },
  { title: 'Best practices for remote attendance', author: 'Community', date: 'Mar 1', category: 'Tips', excerpt: 'Clock-in policies that actually work for distributed teams.', span: '' },
]

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'For small teams trying out BizxFlow.',
    features: ['Up to 5 members', 'Projects & tasks', 'Basic chat', 'Attendance & leave'],
    cta: 'Get started',
    href: '/register',
    primary: false,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12',
    period: 'per seat / month',
    description: 'For growing teams that need the full suite.',
    features: ['Unlimited members', 'Meetings & calendar', 'Real-time chat', 'Analytics & reports', 'Audit logs', 'Priority support'],
    cta: 'Start free trial',
    href: '/register',
    primary: true,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large orgs with advanced needs.',
    features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support', 'SLA & compliance'],
    cta: 'Contact sales',
    href: '#',
    primary: false,
    popular: false,
  },
]


const HERO_PHRASES = ['workforce management', 'team productivity', 'smart workplace', 'AI-powered teams']

const TYPING_MS = 80
const PAUSE_AFTER_TYPING_MS = 1800
const PAUSE_AFTER_DELETE_MS = 400

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function LandingPage(): React.ReactElement {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [typedPhrase, setTypedPhrase] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const target = HERO_PHRASES[phraseIndex]
    const delay = isDeleting ? TYPING_MS / 2 : (typedPhrase === target ? PAUSE_AFTER_TYPING_MS : TYPING_MS)
    const t = setTimeout(() => {
      if (isDeleting) {
        if (typedPhrase.length === 0) {
          setIsDeleting(false)
          setPhraseIndex((i) => (i + 1) % HERO_PHRASES.length)
        } else {
          setTypedPhrase(target.slice(0, typedPhrase.length - 1))
        }
      } else {
        if (typedPhrase === target) {
          setIsDeleting(true)
        } else {
          setTypedPhrase(target.slice(0, typedPhrase.length + 1))
        }
      }
    }, delay)
    return () => clearTimeout(t)
  }, [typedPhrase, phraseIndex, isDeleting])

  const navLinks = (
    <>
      <a
        href={API_DOCS}
        target="_blank"
        rel="noopener noreferrer"
        className="landing-nav-link flex min-h-[44px] items-center rounded-lg border border-[var(--app-border)] px-4 py-3 font-body text-sm font-medium transition hover:bg-[var(--app-card)] hover:text-[var(--app-text)] md:min-h-0 md:inline-block md:py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        API Docs
      </a>
      <Link
        to="/login"
        className="landing-nav-link flex min-h-[44px] items-center rounded-lg px-4 py-3 font-body text-sm font-medium text-[var(--app-muted)] transition hover:text-[var(--app-text)] md:min-h-0 md:inline-block md:py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className="landing-btn-primary flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--app-text)] px-4 py-3 text-center font-body text-sm font-medium text-[var(--app-bg)] md:min-h-0 md:inline-block md:py-2"
        onClick={() => setMobileMenuOpen(false)}
      >
        Get started
      </Link>
    </>
  )

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 border-b border-[var(--app-border)] bg-[var(--app-bg)]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4">
          <Link to="/" className="flex min-h-[44px] min-w-[44px] items-center gap-2 shrink-0 rounded-lg sm:min-h-0 sm:min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-text)] font-display text-sm font-bold text-[var(--app-bg)] sm:h-8 sm:w-8">
              B
            </div>
            <span className="font-display text-base font-bold tracking-tight sm:text-lg">BizxFlow</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <motion.button
              type="button"
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              className="landing-theme-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-[var(--app-card)] hover:text-[var(--app-text)] sm:h-9 sm:w-9"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
            {/* Desktop nav */}
            <div className="hidden items-center gap-2 md:flex">{navLinks}</div>
            {/* Mobile menu button */}
            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-[var(--app-text)] transition-colors hover:bg-[var(--app-card)] md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-[var(--app-border)] bg-[var(--app-bg)] md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-4">
                {navLinks}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-3 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-28 md:pt-28 md:pb-36">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-50 sm:opacity-60"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--app-border) 1px, transparent 1px), linear-gradient(to bottom, var(--app-border) 1px, transparent 1px)',
              backgroundSize: 'clamp(32px, 8vw, 48px) clamp(32px, 8vw, 48px)',
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h1 className="font-display text-2xl font-bold leading-[1.2] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            The complete{' '}
            <span className="inline-block min-w-[0.5em] border-b-2 border-[var(--app-text)] border-opacity-80">
              {typedPhrase}
              <span className="animate-pulse" style={{ animationDuration: '1s' }}>|</span>
            </span>
            {' '}app
          </h1>
          <p className="mt-3 max-w-2xl mx-auto font-body text-sm text-[var(--app-muted)] sm:mt-6 sm:text-base md:text-lg lg:text-xl">
            One platform for projects, meetings, and real-time chat—with smart attendance, leave approvals, AI briefings, and performance insights. Everything your team needs, in one place.
          </p>
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:mt-8 sm:gap-2"
          >
            {HERO_FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <motion.span
                  key={f.label}
                  variants={item}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-2.5 py-1 font-body text-[11px] font-medium text-[var(--app-text)] shadow-sm sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-xs"
                >
                  <Icon className="h-3 w-3 shrink-0 text-[var(--app-muted)] sm:h-3.5 sm:w-3.5" />
                  <span className="truncate max-w-[90px] sm:max-w-none">{f.label}</span>
                </motion.span>
              )
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Demo stats strip */}
      <section className="border-y border-[var(--app-border)] bg-[var(--app-card)] px-3 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4"
          >
            {DEMO_STATS.map((stat) => (
              <motion.div key={stat.label} variants={item} className="text-center">
                <p className="font-display text-lg font-extrabold tracking-tight sm:text-2xl md:text-3xl">{stat.value}</p>
                <p className="mt-0.5 font-body text-[10px] font-medium uppercase tracking-wider text-[var(--app-muted)] sm:mt-1 sm:text-xs">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Core features — bento grid */}
      <section className="px-3 py-12 sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]"
          >
            Core features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Do everything in one place
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 grid grid-cols-2 gap-2 sm:mt-12 sm:grid-cols-3 sm:grid-rows-[auto_auto_auto] sm:gap-4"
          >
            {CORE_FEATURES.map((cell) => {
              const Icon = cell.icon
              return (
                <motion.div
                  key={cell.id}
                  variants={item}
                  whileHover={{ y: -3 }}
                  className={`landing-card-hover flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-3 sm:rounded-2xl sm:p-6 max-sm:col-span-1 max-sm:row-span-1 ${cell.span}`}
                >
                  <motion.div
                    className="landing-icon-bump flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--app-border)] text-[var(--app-muted)] transition-transform sm:h-11 sm:w-11 sm:rounded-xl"
                    whileHover={{ scale: 1.08 }}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.div>
                  <h3 className="mt-2 font-display text-sm font-semibold tracking-tight sm:mt-4 sm:text-lg">{cell.title}</h3>
                  <p className="mt-1 font-body text-xs leading-relaxed text-[var(--app-muted)] sm:mt-2 sm:text-sm line-clamp-3 sm:line-clamp-none">
                    {cell.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* All features — grid */}
      <section className="border-t border-[var(--app-border)] bg-[var(--app-card)]/30 px-3 py-12 sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]"
          >
            Everything included
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            One platform, every tool you need
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-3"
          >
            {ALL_FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  variants={item}
                  whileHover={{ y: -2 }}
                  className={`landing-card-hover flex flex-col gap-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-2.5 max-sm:col-span-1 max-sm:row-span-1 sm:gap-2 sm:p-4 ${f.span}`}
                >
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-[var(--app-border)] text-[var(--app-muted)] sm:h-9 sm:w-9 sm:rounded-lg">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <h3 className="font-display text-xs font-semibold leading-tight tracking-tight sm:text-base">{f.title}</h3>
                  <p className="font-body text-[10px] leading-snug text-[var(--app-muted)] line-clamp-2 sm:text-sm sm:line-clamp-none">{f.description}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Client reviews */}
      <section className="border-t border-[var(--app-border)] px-3 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]"
          >
            What teams say
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Trusted by growing teams
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-4"
          >
            {CLIENT_REVIEWS.map((review) => (
              <motion.article
                key={review.name}
                variants={item}
                whileHover={{ y: -2 }}
                className={`landing-card-hover flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-3 max-sm:col-span-1 max-sm:row-span-1 sm:p-4 ${review.span}`}
              >
                <div className="mb-2 flex gap-0.5 sm:mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[var(--app-muted)] text-[var(--app-muted)] sm:h-4 sm:w-4" />
                  ))}
                </div>
                <p className="font-body text-xs leading-relaxed text-[var(--app-text)] line-clamp-3 sm:text-sm sm:line-clamp-none">&ldquo;{review.quote}&rdquo;</p>
                <div className="mt-3 flex flex-col border-t border-[var(--app-border)] pt-2 sm:mt-4 sm:pt-3">
                  <span className="font-body text-xs font-semibold text-[var(--app-text)] sm:text-sm">{review.name}</span>
                  <span className="font-body text-[10px] text-[var(--app-muted)] sm:text-xs">{review.role}</span>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community posts — bento */}
      <section className="border-t border-[var(--app-border)] bg-[var(--app-card)]/30 px-3 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]"
          >
            Community
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Posts and guides from the community
          </motion.h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4"
          >
            {COMMUNITY_POSTS.map((post) => (
              <motion.article
                key={post.title}
                variants={item}
                whileHover={{ y: -2 }}
                className={`landing-card-hover flex flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 ${post.span}`}
              >
                <div className="flex items-center gap-2 text-[var(--app-muted)]">
                  <span className="font-body text-xs font-medium uppercase tracking-wider">{post.category}</span>
                  <span className="font-body text-xs">·</span>
                  <span className="font-body text-xs">{post.date}</span>
                </div>
                <h3 className="mt-2 font-display text-sm font-semibold leading-snug tracking-tight text-[var(--app-text)] sm:text-base">
                  {post.title}
                </h3>
                <p className="mt-1.5 font-body text-xs leading-relaxed text-[var(--app-muted)] sm:text-sm">
                  {post.excerpt}
                </p>
                <span className="mt-3 font-body text-xs font-medium text-[var(--app-muted)]">by {post.author}</span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-[var(--app-border)] bg-[var(--app-card)]/50 px-3 py-12 sm:px-6 sm:py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-body text-xs font-medium uppercase tracking-[0.2em] text-[var(--app-muted)]"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={container}
            className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {PRICING_PLANS.map((plan) => (
              <motion.article
                key={plan.id}
                variants={item}
                whileHover={{ y: -4 }}
                className={`landing-card-hover relative flex flex-col rounded-2xl border p-4 sm:p-6 ${
                  plan.popular
                    ? 'border-[var(--app-text)] bg-[var(--app-card)] shadow-lg'
                    : 'border-[var(--app-border)] bg-[var(--app-card)]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--app-text)] bg-[var(--app-bg)] px-3 py-1 font-body text-xs font-semibold text-[var(--app-text)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Popular
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold tracking-tight">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className="font-body text-sm text-[var(--app-muted)]">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 font-body text-sm text-[var(--app-muted)]">{plan.description}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 font-body text-sm text-[var(--app-text)]">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--app-border)] text-[var(--app-text)]">
                        <Check className="h-3 w-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.div whileTap={{ scale: 0.98 }} className="mt-8">
                  {plan.href === '#' ? (
                    <a
                      href="#"
                      className={`block rounded-xl py-3 text-center font-body text-sm font-semibold transition ${
                        plan.primary
                          ? 'landing-btn-primary bg-[var(--app-text)] text-[var(--app-bg)]'
                          : 'border border-[var(--app-border)] hover:bg-[var(--app-bg)]'
                      }`}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      to={plan.href}
                      className={`block rounded-xl py-3 text-center font-body text-sm font-semibold transition ${
                        plan.primary
                          ? 'landing-btn-primary bg-[var(--app-text)] text-[var(--app-bg)]'
                          : 'border border-[var(--app-border)] hover:bg-[var(--app-bg)]'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </motion.div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--app-border)] px-3 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Ready to get started?</h2>
            <p className="mt-2 font-body text-sm text-[var(--app-muted)] sm:mt-3 sm:text-base">
              Full REST API with Swagger. Deploy and integrate in minutes.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link
                  to="/register"
                  className="landing-btn-primary inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--app-text)] px-6 py-3.5 text-center font-body text-sm font-semibold text-[var(--app-bg)] sm:min-h-0 sm:w-auto sm:px-8"
                >
                  Create account
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href={API_DOCS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[var(--app-border)] px-6 py-3.5 text-center font-body text-sm font-semibold transition hover:bg-[var(--app-card)] sm:min-h-0 sm:w-auto sm:px-8"
                >
                  Open API Docs
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--app-border)] bg-[var(--app-card)]">
        <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-text)] font-display text-sm font-bold text-[var(--app-bg)]">
                  B
                </div>
                <span className="font-display font-bold tracking-tight">BizxFlow</span>
              </div>
              <p className="mt-3 font-body text-sm text-[var(--app-muted)]">
                The complete workforce app: projects, meetings, chat, attendance, tasks, leave, and more—all in one place.
              </p>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--app-text)]">
                Product
              </h4>
              <ul className="mt-4 space-y-2 font-body text-sm text-[var(--app-muted)]">
                <li>
                  <a href={API_DOCS} target="_blank" rel="noopener noreferrer" className="transition hover:text-[var(--app-text)]">
                    API Docs
                  </a>
                </li>
                <li>
                  <Link to="/register" className="transition hover:text-[var(--app-text)]">Sign up</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--app-text)]">
                Company
              </h4>
              <ul className="mt-4 space-y-2 font-body text-sm text-[var(--app-muted)]">
                <li><a href="#" className="transition hover:text-[var(--app-text)]">About</a></li>
                <li><a href="#" className="transition hover:text-[var(--app-text)]">Contact</a></li>
                <li><a href="#" className="transition hover:text-[var(--app-text)]">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[var(--app-text)]">
                Legal
              </h4>
              <ul className="mt-4 space-y-2 font-body text-sm text-[var(--app-muted)]">
                <li><a href="#" className="transition hover:text-[var(--app-text)]">Privacy</a></li>
                <li><a href="#" className="transition hover:text-[var(--app-text)]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--app-border)] pt-8">
            <p className="font-body text-xs text-[var(--app-muted)]">
              © {new Date().getFullYear()} BizxFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
