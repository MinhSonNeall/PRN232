import { Badge } from '@/components/ui/Badge'

export function AccountStatusBadge({ status }: { status: string }) {
  return <Badge status={status} />
}
