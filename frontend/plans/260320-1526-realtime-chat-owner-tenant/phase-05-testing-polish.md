# Phase 5: Testing & Polish

**Priority:** Medium | **Effort:** 1h | **Status:** Complete
**Depends on:** Phase 4

## Overview

End-to-end validation, edge cases, reconnect behavior, and notification bell integration.

## Manual Test Checklist

### Core Flow
- [ ] Tenant opens request detail → history loads → ChatBox shows
- [ ] Owner opens request view → selects request → ChatBox shows
- [ ] Tenant sends message → appears on owner's screen within 1s (no refresh)
- [ ] Owner sends message → appears on tenant's screen within 1s
- [ ] Both parties see timestamps and name labels correctly
- [ ] Auto-scroll fires on new message

### Auth & Security
- [ ] Unauthenticated user cannot connect to `/hub/chat` (401)
- [ ] User cannot join a chat for a request they're not party to (HubException)
- [ ] Message over 2000 chars rejected at entity level
- [ ] Empty/whitespace message ignored (button disabled)

### State Handling
- [ ] Chat hidden when request is Cancelled/Rejected/Revoked
- [ ] Error state shown if hub connection fails (backend down)
- [ ] Reconnect badge ("Connecting...") visible during reconnect attempt
- [ ] History loads correctly when re-opening a request with existing messages

### Browser Compatibility
- [ ] Chrome — WebSocket (primary)
- [ ] Firefox — WebSocket
- [ ] Edge — WebSocket

## Reconnect Polish

`withAutomaticReconnect()` uses exponential backoff by default (0s, 2s, 10s, 30s).
Show "Reconnecting..." status in ChatBox header when `connected === false` after initial connect.

```typescript
// In useChat hook, track reconnecting state:
conn.onreconnecting(() => setConnected(false))
conn.onreconnected(async () => {
  await conn.invoke('JoinChat', requestId)  // re-join group after reconnect
  setConnected(true)
})
```

## Notification Bell Integration (Optional)

Extend `notification-bell.tsx` to poll for unread messages:

```typescript
// Add to owner branch in fetchNotifications():
// For each accepted arrangement, check if any new messages since last-read timestamp
// Store last-read per requestId in localStorage: hmss_chat_read_{requestId}
```

Keep this lightweight — only check arrangements (accepted requests), not all chats.

## Performance Notes

- Max 50 messages in history (phase 1 limit) — sufficient for MVP
- SignalR groups ensure messages only go to 2 clients, not broadcast to all
- No pagination needed for MVP (add later if needed)

## Final Build Verification

```bash
# Backend
cd backend/Hmss.Api && dotnet build   # must be 0 errors

# Frontend
cd frontend && npx tsc --noEmit       # must be 0 errors
cd frontend && npm run build           # must produce clean build
```

## Known Limitations (Post-MVP)

| Limitation | Future Fix |
|-----------|------------|
| No message pagination | Add cursor-based pagination with "Load earlier" |
| No read receipts | Add `ReadAt` column to `ChatMessages` |
| No file attachments | Extend with CloudStorageGateway upload |
| No push notifications | Add Web Push or email digest |
| History max 50 msgs | Increase limit or add infinite scroll |

## Success Criteria

- All manual test checklist items pass
- Both `dotnet build` and `npm run build` succeed with 0 errors
- Real-time latency < 1s on localhost
- No unhandled promise rejections in browser console
