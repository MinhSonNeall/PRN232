# Phase 4: Frontend - Chat Pages (Owner + Tenant)

## Priority: P1 | Status: pending

## Overview

Create dedicated chat pages at `/owner/chat` and `/tenant/chat` with conversation lists and active chat views.

## Key Insights

- No existing sidebar/layout for owner or tenant routes -- they use the root layout with Navbar
- Navbar has role-based links; add "Chat" link for Owner and Tenant roles
- Owner chat page needs categorized sections (Inquiries, Pending, Current Tenants)
- Tenant chat page is simpler -- flat list of conversations

## Related Code Files

### Create
- `frontend/src/app/owner/chat/page.tsx` -- owner chat page
- `frontend/src/app/tenant/chat/page.tsx` -- tenant chat page
- `frontend/src/components/chat/conversation-list.tsx` -- reusable conversation list sidebar
- `frontend/src/components/chat/conversation-list-item.tsx` -- single conversation row
- `frontend/src/components/chat/owner-chat-layout.tsx` -- owner categorized layout
- `frontend/src/components/chat/chat-panel.tsx` -- right panel with active conversation

### Modify
- `frontend/src/components/layout/Navbar.tsx` -- add Chat links for Owner/Tenant roles

## Architecture

```
/owner/chat (or /tenant/chat)
+-----------------------------------------------+
| Conversation List    |  Active Chat Panel      |
| (left sidebar)       |  (ChatBox component)    |
|                      |                         |
| [Inquiries]          |  Messages...            |
|   - Tenant A         |                         |
| [Pending]            |  [Input field]          |
|   - Tenant B         |                         |
| [Current]            |                         |
|   - Tenant C         |                         |
+-----------------------------------------------+
```

Mobile: conversation list is full-width; tapping opens chat full-screen with back button.

## Implementation Steps

### Navbar Updates

1. Add chat link to role-based nav:
   - Tenant: `{ href: '/tenant/chat', label: 'Chat' }`
   - Owner: `{ href: '/owner/chat', label: 'Chat' }`

### Conversation List Component

2. `conversation-list.tsx`:
   - Props: `{ conversations, selectedId, onSelect, categorized?: boolean }`
   - If `categorized=true` (owner): group by `category` field with section headers
   - Each item shows: other party name, last message preview, timestamp
   - Highlight selected conversation

3. `conversation-list-item.tsx`:
   - Shows avatar placeholder, name, last message snippet, time ago
   - Active state styling (teal border/bg)

### Chat Panel Component

4. `chat-panel.tsx`:
   - Wraps `ChatBox` with a header showing conversation context
   - Empty state when no conversation selected

### Owner Chat Page

5. `/owner/chat/page.tsx`:
   - Uses `useConversations()` to load conversations
   - Two-column layout: conversation list (categorized) | chat panel
   - Category sections: "Inquiries" (no request), "Pending Requests", "Current Tenants"
   - URL state: `?c={conversationId}` for shareable links
   - Mobile: toggle between list and chat views

### Tenant Chat Page

6. `/tenant/chat/page.tsx`:
   - Uses `useConversations()` to load conversations
   - Same two-column layout but flat list (no categories)
   - Each conversation shows owner name + listing context if available

## Success Criteria

- [ ] Owner sees categorized conversation list with correct groupings
- [ ] Tenant sees flat conversation list
- [ ] Selecting a conversation loads real-time chat
- [ ] Navbar shows Chat link for authenticated Owner/Tenant users
- [ ] Responsive: works on mobile with list/chat toggle
- [ ] Empty states handled (no conversations yet)

## Design Guidelines

- Follow existing app design: rounded-2xl cards, stone/teal color palette, shadow-sm
- Consistent with ChatBox styling already in codebase
- Use existing `Button`, `Badge`, `LoadingSpinner` components
