import { useCallback, useEffect, useState } from 'react'
import { leave as leaveApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { isAdminOrManagerRole } from '@/lib/authAccess'
import { isLeavesListOk, parseLeavesFromResponse } from '@/lib/leaveListParse'
import type { LeaveRequest, LeaveReviewStatus, LeaveTypeSubmit } from '@/types/api'
import { displayLeaveStatus, isLeavePending } from '@/lib/leaveStatus'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SlidePanel } from '@/components/ui/SlidePanel'

/** POST /submit-leave — API enum */
const LEAVE_TYPES: { value: LeaveTypeSubmit; label: string }[] = [
  { value: 'Annual', label: 'Annual' },
  { value: 'Sick', label: 'Sick' },
  { value: 'Casual', label: 'Casual' },
]

/** Display name from a user ref (object, id string, nested shapes). */
function personRecordLabel(ref: unknown): string {
  if (ref == null || ref === '') return '—'
  if (typeof ref === 'string') {
    const t = ref.trim()
    if (t === '') return '—'
    if (/^[a-f\d]{24}$/i.test(t)) return `User …${t.slice(-6)}`
    return t
  }
  if (typeof ref === 'object' && ref !== null) {
    const o = ref as Record<string, unknown>
    if (typeof o.$oid === 'string' && o.$oid.trim() !== '') return `User …${o.$oid.slice(-6)}`
    const fn = o.fullName ?? o.name
    if (typeof fn === 'string' && fn.trim() !== '') return fn.trim()
    const em = o.email
    if (typeof em === 'string' && em.trim() !== '') return em.trim()
    if (o.user != null) return personRecordLabel(o.user)
  }
  return '—'
}

/** Employee / applicant column — tries `user`, then common alternate keys from the API. */
function leaveEmployeeDisplayName(r: LeaveRequest): string {
  const row = r as Record<string, unknown>
  const fromUser = personRecordLabel(r.user)
  if (fromUser !== '—') return fromUser
  if (r.employee != null) return personRecordLabel(r.employee)
  if (r.submittedBy != null) return personRecordLabel(r.submittedBy)
  if (r.applicant != null) return personRecordLabel(r.applicant)
  for (const flat of ['employeeName', 'userName', 'fullName', 'applicantName'] as const) {
    const v = row[flat]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  for (const key of ['employeeId', 'userId', 'employeeRef'] as const) {
    const v = row[key]
    if (v != null) {
      const label = personRecordLabel(v)
      if (label !== '—') return label
    }
  }
  return '—'
}

function sortLeavesNewestFirst(leaves: LeaveRequest[]): LeaveRequest[] {
  return [...leaves].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return tb - ta
  })
}

function isLeaveReviewOk(res: unknown): boolean {
  if (res == null || typeof res !== 'object') return false
  const r = res as Record<string, unknown>
  if (r.success === false) return false
  if (r.success === true) return true
  if (typeof r._httpStatus === 'number' && r._httpStatus >= 200 && r._httpStatus < 300) return true
  return false
}

/**
 * Show leave boundaries as calendar dates (avoids "previous day" for `…T00:00:00.000Z`).
 * Accepts `YYYY-MM-DD` or ISO datetimes from the API.
 */
function formatLeaveDate(value: string | undefined): string {
  if (value == null || String(value).trim() === '') return '—'
  const s = value.trim()
  try {
    const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (ymd) {
      const datePart = `${ymd[1]}-${ymd[2]}-${ymd[3]}`
      const d = new Date(`${datePart}T12:00:00`)
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
      }
    }
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { dateStyle: 'medium' })
    }
    return s
  } catch {
    return s
  }
}

function reviewerLabel(r: LeaveRequest): string {
  if (isLeavePending(r.status)) return '—'
  if (r.reviewedByCompany) return 'Company account'
  const byUser = personRecordLabel(r.reviewedBy)
  if (byUser !== '—') return byUser
  if (r.reviewedBy) return 'User reviewer'
  return '—'
}

export function LeavePage(): React.ReactElement {
  const { user, accountType } = useAuth()
  const isCompany = accountType === 'company'
  const isUser = accountType === 'user'
  const isAdminOrManager = isUser && isAdminOrManagerRole(user?.role)

  /** Company JWT or Admin/Manager user: full list + approve/reject (PATCH /update-leave/:id). */
  const canManageTeamLeaves = isCompany || isAdminOrManager
  /** Only user accounts (not company) may call my-leaves / submit-leave */
  const canUseEmployeeLeave = isUser && !!user

  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([])
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveTypeSubmit>(LEAVE_TYPES[0].value)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addToast } = useToast()

  const load = useCallback(() => {
    setLoading(true)

    const applyMy = (res: Awaited<ReturnType<typeof leaveApi.myLeaves>>) => {
      if (isLeavesListOk(res)) {
        setMyLeaves(sortLeavesNewestFirst(parseLeavesFromResponse(res)))
      } else {
        setMyLeaves([])
        const err = res as { success?: boolean; message?: string }
        if (err.success === false && err.message) addToast(err.message, 'error')
      }
    }

    const applyAll = (res: Awaited<ReturnType<typeof leaveApi.allLeaves>>) => {
      if (isLeavesListOk(res)) {
        setAllLeaves(sortLeavesNewestFirst(parseLeavesFromResponse(res)))
      } else {
        setAllLeaves([])
        const err = res as { success?: boolean; message?: string }
        if (err.success === false && err.message) addToast(err.message, 'error')
      }
    }

    if (isCompany) {
      leaveApi
        .allLeaves()
        .then(applyAll)
        .finally(() => {
          setMyLeaves([])
          setLoading(false)
        })
      return
    }

    if (isAdminOrManager) {
      Promise.all([leaveApi.myLeaves(), leaveApi.allLeaves()])
        .then(([myRes, allRes]) => {
          applyMy(myRes)
          applyAll(allRes)
        })
        .finally(() => setLoading(false))
      return
    }

    if (isUser) {
      leaveApi
        .myLeaves()
        .then(applyMy)
        .finally(() => {
          setAllLeaves([])
          setLoading(false)
        })
      return
    }

    setMyLeaves([])
    setAllLeaves([])
    setLoading(false)
  }, [isCompany, isUser, isAdminOrManager, addToast])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!startDate || !endDate || !leaveType) return
    setSubmitting(true)
    leaveApi
      .submit({ leaveType, startDate, endDate, reason: reason || undefined })
      .then((res) => {
        if (res.success) {
          addToast('Leave submitted.')
          setStartDate('')
          setEndDate('')
          setReason('')
          setLeaveType(LEAVE_TYPES[0].value)
          setPanelOpen(false)
          load()
        } else {
          addToast((res as { message: string }).message ?? 'Failed', 'error')
        }
      })
      .finally(() => setSubmitting(false))
  }

  function handleApproveReject(id: string, status: LeaveReviewStatus): void {
    leaveApi.update(id, { status }).then((res) => {
      if (isLeaveReviewOk(res)) {
        addToast(status === 'Approved' ? 'Leave approved.' : 'Leave rejected.')
        load()
      } else {
        addToast((res as { message?: string }).message ?? 'Failed to update leave', 'error')
      }
    })
  }

  const sharedColumns = [
    {
      key: 'leaveType',
      header: 'Type',
      render: (r: LeaveRequest) => (r.leaveType ? r.leaveType.replace(/-/g, ' ') : '—'),
    },
    { key: 'startDate', header: 'Start', render: (r: LeaveRequest) => formatLeaveDate(r.startDate) },
    { key: 'endDate', header: 'End', render: (r: LeaveRequest) => formatLeaveDate(r.endDate) },
    {
      key: 'reason',
      header: 'Reason',
      render: (r: LeaveRequest) => (r.reason?.trim() ? r.reason : '—'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: LeaveRequest) => <StatusBadge status={displayLeaveStatus(r.status)} />,
    },
  ] as const

  const reviewerColumn = {
    key: 'reviewedBy',
    header: 'Reviewed by',
    render: (r: LeaveRequest) => reviewerLabel(r),
  }

  const myTableColumns = [...sharedColumns, reviewerColumn]

  const teamTableColumns = [
    { key: 'user', header: 'Employee', render: (r: LeaveRequest) => leaveEmployeeDisplayName(r) },
    ...sharedColumns,
    reviewerColumn,
    ...(canManageTeamLeaves
      ? [
          {
            key: '_actions',
            header: 'Actions',
            render: (r: LeaveRequest) =>
              isLeavePending(r.status) ? (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleApproveReject(r._id, 'Approved')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleApproveReject(r._id, 'Rejected')}>
                    Reject
                  </Button>
                </div>
              ) : (
                '—'
              ),
          },
        ]
      : []),
  ]

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:justify-end">
        {canUseEmployeeLeave && (
          <Button variant="primary" className="w-full shrink-0 sm:w-auto" onClick={() => setPanelOpen(true)}>
            Apply leave
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="min-w-0 overflow-hidden p-0">
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--app-border)] border-t-[var(--app-text)]" />
          </div>
        </Card>
      ) : (
        <>
          {isAdminOrManager && (
            <section className="min-w-0 space-y-3">
              <h2 className="font-display text-lg font-semibold text-[var(--app-text)]">My leave</h2>
              <Card className="min-w-0 overflow-hidden p-0">
                <DataTable<LeaveRequest>
                  columns={myTableColumns}
                  data={myLeaves}
                  keyExtractor={(r) => r._id}
                  emptyMessage="No leave requests"
                />
              </Card>
            </section>
          )}

          {canManageTeamLeaves && (
            <section className="min-w-0 space-y-3">
              <h2 className="font-display text-lg font-semibold text-[var(--app-text)]">
                {isCompany ? 'All leave requests' : 'Team leave requests'}
              </h2>
              <p className="font-body text-sm text-[var(--app-muted)]">
                {isCompany
                  ? 'Review and approve or reject leave for everyone in your company.'
                  : 'Approve or reject pending requests from employees in your company.'}
              </p>
              <Card className="min-w-0 overflow-hidden p-0">
                <DataTable<LeaveRequest>
                  columns={teamTableColumns}
                  data={allLeaves}
                  keyExtractor={(r) => r._id}
                  emptyMessage="No leave requests"
                />
              </Card>
            </section>
          )}

          {isUser && !isAdminOrManager && (
            <Card className="min-w-0 overflow-hidden p-0">
              <DataTable<LeaveRequest>
                columns={myTableColumns}
                data={myLeaves}
                keyExtractor={(r) => r._id}
                emptyMessage="No leave requests"
              />
            </Card>
          )}
        </>
      )}

      <SlidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Apply for leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="w-full">
            <label
              htmlFor="leave-type"
              className="mb-1.5 block font-body text-xs font-medium uppercase tracking-wider text-[var(--app-muted)]"
            >
              Leave type
            </label>
            <select
              id="leave-type"
              required
              value={leaveType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLeaveType(e.target.value as LeaveTypeSubmit)}
              className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] px-3 py-2.5 font-body text-sm text-[var(--app-text)] outline-none transition focus:border-[var(--app-text)]"
            >
              {LEAVE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End date"
            type="date"
            value={endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            required
          />
          <Input
            label="Reason (optional)"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={submitting}>
            Submit
          </Button>
        </form>
      </SlidePanel>
    </div>
  )
}
