---
title: "Chat System Overhaul - Direct Messaging & Chat Pages"
description: "Extend chat from request-scoped to support direct owner-tenant conversations, dedicated chat pages, and floating chat button"
status: pending
priority: P1
effort: 16h
branch: TBD
tags: [chat, signalr, real-time, messaging]
created: 2026-03-21
---

# Chat System Overhaul

## Current State

- Chat is **request-scoped**: `ChatMessage.RequestId` is the conversation key
- `ChatHub` has `JoinChat(requestId)` and `SendMessage(requestId, body)` -- auth checks caller is tenant or listing owner of that request
- `ChatController` has `GET /api/chat/{requestId}/history` -- same auth
- Frontend: `useChat(requestId)` hook, `ChatBox` component, used in tenant request detail + owner room requests page
- No `Conversation` entity, no conversations list endpoint, no direct messaging

## Architecture Decision

Introduce a `Conversation` entity as the new first-class chat grouping. Conversations can be:
1. **Request-scoped** (existing behavior) -- linked to a `RentalRequest`
2. **Direct** (new) -- between a tenant and owner with no request, initiated from room listing page

This avoids breaking existing chat while enabling the new features. The `ChatMessage` table gets a new `ConversationId` FK (nullable initially for migration, then required).

## Phase Overview

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | Backend: Conversation entity & migration | pending | 3h |
| 2 | Backend: Hub & API overhaul | pending | 3h |
| 3 | Frontend: Chat infrastructure refactor | pending | 2h |
| 4 | Frontend: Chat pages (owner + tenant) | pending | 4h |
| 5 | Frontend: Contact Owner button & floating chat | pending | 2h |
| 6 | Testing & integration | pending | 2h |

---

See phase files for detailed implementation steps.
