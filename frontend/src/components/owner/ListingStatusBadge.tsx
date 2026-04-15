import { Badge } from '@/components/ui/Badge'

export function ListingStatusBadge({ status }: { status: string }) {
  return <Badge status={status} />
}
