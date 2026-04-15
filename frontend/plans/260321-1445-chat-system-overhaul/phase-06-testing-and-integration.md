# Phase 6: Testing & Integration

## Priority: P1 | Status: pending

## Overview

End-to-end validation that all chat features work together. Verify backward compatibility with existing request-scoped chat.

## Implementation Steps

### Backend Testing

1. Verify EF migration applies cleanly on fresh DB and existing DB with seed data
2. Test conversation creation:
   - Direct conversation (no request)
   - Request-scoped conversation auto-creation
   - Idempotency of FindOrCreateAsync
3. Test hub methods:
   - `JoinConversation` + `SendConversationMessage` for direct chats
   - Old `JoinChat` + `SendMessage` still work for request chats
   - Auth rejection for non-participants
4. Test API endpoints:
   - `GET /conversations` returns correct categorization for owners
   - `POST /conversations/start` creates conversation and returns it
   - `GET /conversations/{id}/history` returns messages

### Frontend Testing

5. Verify existing chat in request detail pages still works (tenant + owner views)
6. Test tenant flow:
   - Visit room listing -> click Contact Owner -> conversation created -> chat works
   - Visit /tenant/chat -> see conversation list -> select -> chat works
7. Test owner flow:
   - Visit /owner/chat -> see categorized conversations -> select -> chat works
   - Verify categorization accuracy (inquiry vs pending vs current tenant)
8. Test floating chat:
   - Appears for logged-in users only
   - Opens panel, shows conversations, can send messages
   - Does not appear for visitors
9. Mobile responsiveness check on chat pages

### Integration Checks

10. Two browser tabs: owner + tenant -- verify real-time message delivery both directions
11. Verify conversation list updates when new message arrives (last message preview)
12. Test edge case: tenant starts direct chat, then later submits rental request -- categorization should update

## Success Criteria

- [ ] All existing request-scoped chat functionality preserved
- [ ] Direct messaging works end-to-end
- [ ] Owner categorization is accurate
- [ ] Real-time delivery works across browser tabs
- [ ] No console errors, no broken SignalR connections
- [ ] Mobile layouts render correctly
