# Google OAuth Login

**Date:** 2026-03-20 | **Status:** Planned
**Stack:** ASP.NET Core .NET 8 (backend OAuth flow) + Next.js 16

## Approach

**Backend-driven OAuth** — ASP.NET Core handles the full OAuth 2.0 code exchange with Google, then issues the existing JWT. Frontend just redirects and receives the token. No new npm packages needed on frontend.

Flow:
```
User clicks "Login with Google"
  → Frontend redirects to GET /api/auth/google
  → Backend redirects to Google consent screen
  → Google redirects to GET /api/auth/google/callback?code=...
  → Backend: exchange code → verify ID token → find/create user → issue JWT
  → Backend redirects to frontend /login/google-callback?token=...&role=...
  → Frontend: stores token → redirects by role
```

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | Google Cloud setup + backend OAuth handler | 1.5h | Planned |
| 2 | Backend user find/create + JWT issue | 1h | Planned |
| 3 | Frontend: Google login button + callback page | 1h | Planned |
| 4 | Testing & edge cases | 0.5h | Planned |

**Total:** ~4h

## Key Dependencies

- Google Cloud project with OAuth 2.0 credentials (Client ID + Secret)
- NuGet: `Microsoft.AspNetCore.Authentication.Google` (or raw HTTP, see Phase 1)
- No new frontend npm packages needed

## Phase Files

- `phase-01-backend-google-oauth.md`
- `phase-02-backend-user-jwt.md`
- `phase-03-frontend-google-login.md`
- `phase-04-testing.md`
