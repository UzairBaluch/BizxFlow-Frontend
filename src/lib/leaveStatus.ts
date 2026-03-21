/** Normalize leave workflow status from API (any casing) for comparisons and display. */
export function isLeavePending(status: string | undefined): boolean {
  return (status ?? '').toLowerCase() === 'pending'
}

export function displayLeaveStatus(status: string | undefined): string {
  if (!status) return '—'
  const t = status.toLowerCase()
  if (t === 'pending') return 'Pending'
  if (t === 'approved') return 'Approved'
  if (t === 'rejected') return 'Rejected'
  return status
}
