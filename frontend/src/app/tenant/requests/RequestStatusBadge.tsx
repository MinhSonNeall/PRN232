import { Badge } from '@/components/ui/Badge'

export function RequestStatusBadge({ status }: { status: string }) {
  return <Badge status={status} />
}
