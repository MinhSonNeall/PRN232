interface BadgeProps {
  status: string
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Suspended: 'bg-orange-100 text-orange-800',
  Disabled: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  CancelledByTenant: 'bg-stone-100 text-stone-800',
  RevokedByOwner: 'bg-stone-100 text-stone-800',
  Draft: 'bg-stone-100 text-stone-700',
  PublishedAvailable: 'bg-green-100 text-green-800',
  Locked: 'bg-blue-100 text-blue-800',
  Hidden: 'bg-yellow-100 text-yellow-800',
  Archived: 'bg-stone-100 text-stone-500',
  PendingReview: 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-green-100 text-green-800',
}

export function Badge({ status, className = '' }: BadgeProps) {
  const color = STATUS_COLORS[status] ?? 'bg-stone-100 text-stone-800'
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}>
      {status}
    </span>
  )
}
