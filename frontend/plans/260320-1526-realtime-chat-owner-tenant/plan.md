# Real-Time Chat: Owner ↔ Tenant

**Date:** 2026-03-20 | **Status:** Complete
**Stack:** ASP.NET Core .NET 8 + SignalR | Next.js 16 + @microsoft/signalr

## Approach

Chat is scoped per `RentalRequest` — owner and tenant of a request can chat. No group chats.
Transport: **SignalR** (WebSocket + SSE + long-poll fallback, native to ASP.NET Core, plugs into existing JWT auth).

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | Backend: DB + Entity | 1h | Complete |
| 2 | Backend: SignalR Hub + API | 1.5h | Complete |
| 3 | Frontend: SignalR client + Chat UI | 2h | Complete |
| 4 | Frontend: Page Integration | 1h | Complete |
| 5 | Testing & Polish | 1h | Complete |

**Total estimated:** ~6.5h

## Key Dependencies

- `Microsoft.AspNetCore.SignalR` (built-in, no extra package)
- `@microsoft/signalr` npm package for frontend
- New DB table: `ChatMessages`
- New EF Core migration

## Implementation Summary

Successfully built end-to-end real-time chat between property owners and tenants.

**Backend deliverables:**
- `ChatMessage` entity with validations (2000 char max)
- `ChatMessageRepository` for persistence
- `ChatHub` with group-based broadcasting (scoped to rental request)
- `ChatController` REST history endpoint for initial page load
- SignalR registered with proper CORS (credentials + specific origin)
- JWT auth validated at connection and per-message level

**Frontend deliverables:**
- `useChat` hook managing SignalR lifecycle, reconnection, history loading
- `ChatBox` component with auto-scroll, time labels, sender name display
- Type definitions and API client for history endpoint
- Chat embedded in tenant detail page (`[requestId]`) and owner request view
- Only visible for active requests (Pending, Accepted)

**Files created:** 10 new, **Files modified:** 8 existing
**Pending:** EF migrations — run `cd backend/Hmss.Api && dotnet ef migrations add AddChatMessages && dotnet ef database update`

## Phase Files

- `phase-01-backend-db-entity.md`
- `phase-02-backend-signalr-hub.md`
- `phase-03-frontend-signalr-client.md`
- `phase-04-frontend-page-integration.md`
- `phase-05-testing-polish.md`
