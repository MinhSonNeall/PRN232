# Phase 5: Frontend - Contact Owner Button & Floating Chat

## Priority: P2 | Status: pending

## Overview

Add "Contact Owner" button on room listing page and a floating chat button accessible site-wide for logged-in users.

## Key Insights

- Room detail page at `src/app/(visitor)/room/[listingId]/page.tsx`
- "Request to Rent" button is in the price card sidebar -- "Contact Owner" goes below it
- Backend `RoomDetailDto` needs `OwnerId` (added in Phase 2)
- Floating chat: a persistent button in the bottom-right corner, opens a mini chat panel
- Only shown for authenticated users (Tenant or Owner role)

## Related Code Files

### Modify
- `frontend/src/app/(visitor)/room/[listingId]/page.tsx` -- add Contact Owner button
- `frontend/src/types/listing.ts` -- add ownerId to RoomDetailDto
- `frontend/src/app/layout.tsx` -- add FloatingChatButton component

### Create
- `frontend/src/components/chat/floating-chat-button.tsx` -- FAB-style chat button
- `frontend/src/components/chat/floating-chat-panel.tsx` -- expandable mini chat panel

## Implementation Steps

### Contact Owner Button

1. Update `RoomDetailDto` frontend type to include `ownerId`
2. In room detail page, below the "Request to Rent" button, add "Contact Owner" button:
   - Only visible for logged-in Tenant users
   - On click: call `chatApi.startConversation(room.ownerId)` to get/create conversation
   - Then redirect to `/tenant/chat?c={conversationId}`
   - Alternative UX: open floating chat panel with that conversation (simpler)
3. If user not logged in, show "Login to Contact Owner" linking to `/login?redirect=/room/{listingId}`

### Floating Chat Button

4. `floating-chat-button.tsx`:
   - Fixed position bottom-right, z-50
   - Chat icon (SVG), teal-600 bg, rounded-full
   - Only rendered when `isAuthenticated` (use `useAuth()`)
   - Click toggles floating chat panel open/closed
   - Badge showing unread count (future enhancement, skip for MVP)

5. `floating-chat-panel.tsx`:
   - Positioned above the FAB, fixed bottom-right
   - Contains mini conversation list + chat view (tab/toggle)
   - Uses same `useConversations` hook
   - Compact layout: 360px wide, 480px tall max
   - Close button to minimize back to FAB
   - Selecting a conversation loads ChatBox inline

6. Add `FloatingChatButton` to root layout (`src/app/layout.tsx`):
   - Render after `<Footer />`, outside main content flow
   - Conditionally rendered (client component wrapping)

## Success Criteria

- [ ] "Contact Owner" button visible on room listing page for tenants
- [ ] Clicking it creates/finds conversation and opens chat
- [ ] Floating chat button visible on all pages for logged-in users
- [ ] Floating panel shows conversation list and allows chatting
- [ ] Non-authenticated users don't see floating button

## Design Guidelines

- Contact Owner button: secondary variant, full-width, below Request to Rent
- Floating button: 56px circle, teal-600, subtle shadow-lg, hover scale effect
- Floating panel: white bg, rounded-2xl, shadow-2xl, smooth open/close animation
- Match existing ChatBox styling for consistency
