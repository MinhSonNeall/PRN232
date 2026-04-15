# Phase 4: Frontend — Page Integration

**Priority:** High | **Effort:** 1h | **Status:** Complete
**Depends on:** Phase 3

## Overview

Embed `ChatBox` into the relevant pages where owner and tenant interact with a rental request.

## Where Chat Appears

| Page | Who sees it | requestId source |
|------|-------------|-----------------|
| `tenant/requests/[requestId]/page.tsx` (request detail) | Tenant | URL param |
| `owner/requests/room/[roomId]/page.tsx` → request detail view | Owner | Selected request row |

Chat should only be visible for **non-terminal requests** (Pending, Accepted). Hide for Cancelled/Rejected/Revoked.

## Related Code Files

- **Modify:** `frontend/src/app/tenant/requests/page.tsx` — add chat section to request detail
- **Create:** `frontend/src/app/tenant/requests/[requestId]/page.tsx` — dedicated detail page with chat
- **Modify:** `frontend/src/app/owner/requests/room/[roomId]/page.tsx` — embed ChatBox per selected request

## Tenant Side

Currently `tenant/requests/page.tsx` shows a list. Add a detail page at `/tenant/requests/[requestId]`:

```tsx
// app/tenant/requests/[requestId]/page.tsx
import { ChatBox } from '@/components/shared/ChatBox'
import { rentalRequestsApi } from '@/lib/api/rental-requests'

export default async function TenantRequestDetailPage({
  params
}: { params: { requestId: string } }) {
  // ... load request detail
  const isChatActive = ['Pending', 'Accepted'].includes(detail.status)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* existing request detail cards */}

      {isChatActive && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-stone-800">Chat with Owner</h2>
          <ChatBox requestId={params.requestId} otherPartyName={detail.ownerName} />
        </section>
      )}
    </div>
  )
}
```

## Owner Side

In `owner/requests/room/[roomId]/page.tsx`, when owner clicks a request row to expand details, show ChatBox below the request info:

```tsx
// Inside the expanded request detail section:
{selectedRequest && ['Pending', 'Accepted'].includes(selectedRequest.status) && (
  <div className="mt-6">
    <h3 className="mb-3 text-sm font-semibold text-stone-700">Chat with Tenant</h3>
    <ChatBox
      requestId={selectedRequest.requestId}
      otherPartyName={selectedRequest.tenantName}
    />
  </div>
)}
```

## Navigation Update

Add "Chat" link/indicator in `RequestSummaryDto` display:
- Tenant requests list: each row gets a "💬" unread badge or "Chat" link → `/tenant/requests/{requestId}`
- Notification bell: extend owner polling to check for new messages (optional, Phase 5)

## RequestDetailDto Check

Verify `RequestDetailResponseDto` returned from API includes:
- `ownerName` (for tenant's ChatBox label)
- `tenantName` (for owner's ChatBox label)

If missing, add to backend DTO in this phase.

## Implementation Steps

1. Create `app/tenant/requests/[requestId]/page.tsx` with detail + ChatBox
2. Add `ChatBox` to owner request detail expanded view
3. Add link from request list row → detail page (tenant side)
4. Verify `RequestDetailResponseDto` has party names; patch if missing
5. Hide ChatBox for terminal statuses (Cancelled, Rejected, Revoked)

## Success Criteria

- Tenant can open a request and see chat at bottom
- Owner can click a request and see chat
- Chat hidden for cancelled/rejected requests
- Page navigates correctly from request list → detail
