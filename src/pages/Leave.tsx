import { useCallback, useEffect, useState } from 'react'
import { leave as leaveApi } from '@/api/client'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
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

function userName(r: LeaveRequest): string {
  if (typeof r.user === 'object' && r.user && 'fullName' in r.user) {
    return (r.user as { fullName: string }).fullName
  }
  return String(r.user)
}

function reviewerLabel(r: LeaveRequest): string {
  if (isLeavePending(r.status)) return '—'
  if (r.reviewedByCompany) return 'Company account'
  if (r.reviewedBy && typeof r.reviewedBy === 'object' && 'fullName' in r.reviewedBy) {
    return (r.reviewedBy as { fullName: string }).fullName
  }
  if (r.reviewedBy) return 'User reviewer'
  return '—'
}

export function LeavePage(): React.ReactElement {
  const { user, accountType } = useAuth()
  const isCompany = accountType === 'company'
  const isUser = accountType === 'user'
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager'

  /** Company or Admin/Manager user: approve/reject + all-leaves for this company */
  const canManageTeamLeaves = isCompany || (isUser && isAdminOrManager)
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
      if (res.success && res.data) {
        const d = res.data as { leaves?: LeaveRequest[] }
        setMyLeaves(d.leaves ?? [])
      } else {
        setMyLeaves([])
        if (!res.success && res.message) {
          addToast(res.message, 'error')
        }
      }
    }

    const applyAll = (res: Awaited<ReturnType<typeof leaveApi.allLeaves>>) => {
      if (res.success && res.data) {
        const d = res.data as { leaves?: LeaveRequest[] }
        setAllLeaves(d.leaves ?? [])
      } else {
        setAllLeaves([])
        if (!res.success && res.message) {
          addToast(res.message, 'error')
        }
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

    if (isUser && isAdminOrManager) {
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
      if (res.success) {
        addToast(`Leave ${status}.`)
        load()
      } else {
        addToast((res as { message: string }).message ?? 'Failed', 'error')
      }
    })
  }

  const sharedColumns = [
    {
      key: 'leaveType',
      header: 'Type',
      render: (r: LeaveRequest) => (r.leaveType ? r.leaveType.replace(/-/g, ' ') : '—'),
    },
    { key: 'startDate', header: 'Start', render: (r: LeaveRequest) => r.startDate },
    { key: 'endDate', header: 'End', render: (r: LeaveRequest) => r.endDate },
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
    { key: 'user', header: 'Employee', render: (r: LeaveRequest) => userName(r) },
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
          {isUser && isAdminOrManager && (
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
                {isCompany ? 'All leave requests' : 'Team leave (approve / reject)'}
              </h2>
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
