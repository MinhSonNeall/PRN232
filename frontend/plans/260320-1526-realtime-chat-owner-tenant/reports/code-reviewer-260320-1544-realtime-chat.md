# Code Review: Real-time Chat Feature

**Date:** 2026-03-20
**Score: 8 / 10**

---

## Scope

| Layer | Files |
|-------|-------|
| Backend (ASP.NET Core) | ChatMessage.cs, IChatMessageRepository.cs, ChatMessageRepository.cs, ChatHub.cs, ChatController.cs, ChatMessageDto.cs |
| Frontend (Next.js/TS) | types/chat.ts, lib/api/chat.ts, hooks/use-chat.ts, components/shared/ChatBox.tsx, app/tenant/requests/[requestId]/page.tsx |

---

## Overall Assessment

Solid implementation. Authorization is correctly enforced on both hub and REST endpoints using a proper participant check. SignalR JWT wiring (query-param via `accessTokenFactory` + `OnMessageReceived`) is textbook-correct. The main problems are a subtle race window, a missing reconnect re-join, an N+1 DB cost per message send, and a `SentAt` UTC/local mismatch.

---

## Critical Issues

None.

---

## High Priority

### 1. Missing `OnReconnectedAsync` — SignalR group lost on reconnect

`withAutomaticReconnect()` is enabled on the client. After a transport drop, the client reconnects and receives a new `connectionId`, but the server **never re-adds the connection to the SignalR group**. The client does not call `JoinChat` again. Live messages will be silently dropped until the user refreshes.

**Fix:** Override `OnReconnectedAsync` in `ChatHub` to re-join the group (requires storing `requestId` in `Context.Items` or a server-side dictionary keyed by `connectionId`), **or** add a `onreconnected` handler on the client that calls `conn.invoke('JoinChat', requestId)`.

Client-side fix is simpler and avoids server-side state:
```typescript
conn.onreconnected(() => {
  conn.invoke('JoinChat', requestId).catch(console.error)
})
```

### 2. N+1 DB query per `SendMessage` call

`ChatHub.SendMessage` calls `AuthorizeAccess(rid)` which issues `FindByIdWithPropertyAsync` on every message. For a busy conversation this is one full JOIN query per send.

**Fix:** Cache the authorization check in `Context.Items` after `JoinChat` succeeds. If `Context.Items["authorized_" + requestId]` is set, skip the DB call in `SendMessage`.

---

## Medium Priority

### 3. Race condition: history load vs live `ReceiveMessage` handler

In `useChat`, `ReceiveMessage` is registered **before** `conn.start()`. If the hub broadcasts a message between `conn.start()` resolving and `JoinChat` returning (extremely narrow window), no duplicate is created — this is fine. However, `history` is loaded **before** the connection starts, so any message sent after the REST call but before `JoinChat` is **silently missed** (it won't be in history, and the `ReceiveMessage` handler won't fire until after `JoinChat`).

The gap:
```
chatApi.getHistory()  →  conn.start()  →  JoinChat()
                         ↑ messages sent here are lost
```

**Fix:** Load history after `JoinChat` returns, or deduplicate by `messageId` and broadcast any missed messages via a re-fetch trigger.

### 4. `SentAt` is UTC but rendered with `toLocaleTimeString` without timezone annotation

`DateTime.UtcNow` → serialized as ISO 8601 without `Z` suffix on some .NET serializer configs → parsed by `new Date(msg.sentAt)` as local time → displayed time is wrong by UTC offset.

**Verify:** Confirm the API response includes `Z` suffix (e.g., `"2026-03-20T14:22:00Z"`). If not, either append `Z` on deserialization or fix the serializer to emit `DateTimeKind.Utc`.

### 5. `ChatRepository.FindByRequestIdAsync` double-sort is legal but fragile

```csharp
.OrderByDescending(m => m.SentAt)  // used by Take() to get latest N
.Take(limit)
.OrderBy(m => m.SentAt)            // re-sort for display
```

EF Core translates this into a nested subquery — correct, but non-obvious and may trip up future maintainers or certain DB providers. Consider using `Skip`/`Take` with explicit ascending sort and a separate count, or document the intent explicitly.

### 6. `SendMessage` in hub uses `Context.User!.Identity!.Name` for `SenderName`

`Identity.Name` maps to the `name` claim. If the JWT was issued without a `name` claim (only `sub`/`email`), this silently falls back to `"Unknown"`. History load correctly uses `m.Sender.FullName` (DB value). The two sources can diverge, causing different names for history vs live messages.

**Fix:** Load `SenderName` from the DB after save (the `Sender` nav prop on `ChatMessage` won't be populated by `Create()`), or embed `FullName` as a claim at JWT issue time.

---

## Minor Issues

### 7. `Guid.Parse` in hub methods — no validation guard

`JoinChat(string requestId)` and `SendMessage(string requestId, string body)` call `Guid.Parse` which throws `FormatException` on malformed input. SignalR wraps unhandled exceptions as a generic `HubException` on the client, but the error message leaks internal details. Use `Guid.TryParse` and throw a clean `HubException("Invalid requestId")`.

### 8. No client-side 2000-char enforcement before invoking hub

`ChatBox` correctly sets `maxLength={2000}` on the input, but `sendMessage` in `use-chat.ts` doesn't guard against >2000 chars (e.g., if called programmatically). The domain entity enforces it, resulting in an unhandled hub exception that surfaces as a generic error. Add a pre-check in `sendMessage`.

### 9. CORS origin is hardcoded to `localhost:3000` only

Production origin is not present. This blocks the SignalR handshake in staging/prod environments. Should be driven by configuration (e.g., `appsettings.Production.json`).

### 10. `connRef.current` not cleared on cleanup

`useEffect` cleanup calls `conn.stop()` but `connRef.current` still holds the stopped connection. A subsequent `sendMessage` call (possible in React strict-mode double-effect or during teardown) would invoke a dead connection.

**Fix:** Add `connRef.current = null` in the cleanup.

---

## Checklist (per request)

| # | Item | Status |
|---|------|--------|
| 1 | ChatHub validates sender is participant | PASS — `AuthorizeAccess` called on both `JoinChat` and `SendMessage` |
| 2 | User cannot read another user's messages | PASS — `ChatController.GetHistory` enforces participant check |
| 3 | JWT passed via `accessTokenFactory` + query param | PASS — `OnMessageReceived` + `accessTokenFactory` both set |
| 4 | `useChat` cleans up connection on unmount | PASS — cleanup returns `conn.stop()` |
| 5 | Hub errors surfaced to UI | PASS — `catch` in `start()` sets `error` state; `ChatBox` renders error banner |
| 6 | Race: messages arrive before JoinChat | PARTIAL — narrow window exists between `conn.start()` and `JoinChat` (see issue #3) |
| 7 | CORS `AllowCredentials()` set | PASS — `Program.cs` line 47 |
| 8 | 2000-char limit enforced | PASS (backend domain model); minor gap on hub input (see issue #8) |
| 9 | Hub re-joins group after reconnect | FAIL — no `onreconnected` handler (see issue #1) |

---

## Positive Observations

- `[Authorize]` on hub + participant check on every hub method is defense-in-depth.
- `accessTokenFactory` pattern is correct for WebSocket JWT — many implementations get this wrong.
- Domain entity `ChatMessage.Create()` enforces invariants at construction (body length, trim).
- History loaded before `conn.start()` is a thoughtful ordering choice.
- `sendMessage` useCallback has correct dependency array (`[requestId]`).
- `ChatBox` input is disabled while not connected — prevents premature sends.

---

## Recommended Actions (priority order)

1. Add `conn.onreconnected()` in `use-chat.ts` to re-invoke `JoinChat` (HIGH — silent data loss).
2. Cache auth result in `Context.Items` after `JoinChat` to avoid N+1 (HIGH — performance).
3. Fix `SenderName` in hub to use DB value instead of `Identity.Name` (MEDIUM — data consistency).
4. Verify UTC `Z` suffix on `SentAt` serialization (MEDIUM — display bug in non-UTC timezones).
5. Move history load to after `JoinChat` to close the race window (MEDIUM).
6. Add `connRef.current = null` in cleanup (MINOR).
7. Replace `Guid.Parse` with `Guid.TryParse` + clean error in hub methods (MINOR).
8. Drive CORS origins from config for non-local environments (MINOR).

---

## Unresolved Questions

- Does `.NET` JSON serializer emit `Z` suffix for `DateTime` fields (i.e., is `JsonSerializerOptions.DefaultIgnoreCondition` / `DateTimeKind` configured globally)?
- Is `Identity.Name` claim populated at JWT issue time in `JwtTokenService`, or only `sub`/`email`?
- Is there an owner-side page with `ChatBox` (symmetric view)? If so, same review checklist applies to that page.
