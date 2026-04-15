# Phase 4: Testing & Edge Cases

**Priority:** High | **Effort:** 0.5h | **Status:** Planned
**Depends on:** Phase 3

## Overview

Manual end-to-end tests, edge case validation, and build verification for the Google OAuth login flow.

## Manual Test Checklist

### Happy Path
- [ ] Google button visible on `/login` page below password form
- [ ] Button has correct Google colors (blue/green/yellow/red G icon)
- [ ] Clicking button navigates to `http://localhost:5236/api/auth/google`
- [ ] Backend redirects to Google consent screen
- [ ] Selecting a Google account → Google redirects to `/api/auth/google/callback?code=...&state=...`
- [ ] Backend exchanges code, creates/finds user, issues JWT
- [ ] Frontend `/login/google-callback` receives `?token=...&role=...`
- [ ] Spinner shown briefly ("Signing you in...")
- [ ] Tenant role → redirected to `/tenant/requests`
- [ ] Owner role → redirected to `/owner/requests` (if applicable)

### New User (First Google Login)
- [ ] New row created in `UserAccounts` table
- [ ] `Role = Tenant`, `AccountStatus = Active`
- [ ] `PasswordHash` is a BCrypt hash (not empty string)
- [ ] `FullName` populated from Google profile name
- [ ] `Phone` is empty string
- [ ] JWT issued successfully, redirect works

### Existing Email (Password Account)
- [ ] Log in as existing account (no duplicate row created)
- [ ] JWT uses existing user's `UserId` and `Role`
- [ ] Verify `UserAccounts` count doesn't increase

### Error Cases
- [ ] User clicks "Cancel" on Google consent → `?error=access_denied` in callback
- [ ] Frontend shows: "Google sign-in was cancelled." on login page
- [ ] CSRF state mismatch (tamper state cookie) → `?error=invalid_state`
- [ ] Frontend shows: "Security check failed. Please try again."
- [ ] Disabled account → `?error=account_disabled`
- [ ] Frontend shows: "Your account has been disabled."
- [ ] Unverified Google email → `?error=auth_failed` (caught in try/catch)
- [ ] Malformed token (base64 decode fails) → redirects to `/login?error=Invalid+token`

### URL Error Display
- [ ] Manually navigate to `/login?error=Some+error+message`
- [ ] Red error box appears above the form with "Some error message"
- [ ] Error not shown if `?error=` absent

## Build Verification

```bash
# Backend
cd backend/Hmss.Api
dotnet build          # 0 errors

# Frontend
cd frontend
npx tsc --noEmit     # 0 type errors
npm run build         # clean production build
```

## DB Verification

After first Google login:

```sql
SELECT UserId, Email, FullName, Role, AccountStatus, Phone
FROM UserAccounts
WHERE Email = 'your-google-email@gmail.com';
-- Expect: Role=Tenant, AccountStatus=Active, Phone=''
```

## Security Spot Checks

| Check | How to verify |
|-------|---------------|
| Client Secret never in browser | Open DevTools → Network → confirm no requests expose secret |
| State cookie is HttpOnly | DevTools → Application → Cookies → oauth_state has HttpOnly flag |
| State cookie deleted after use | After callback completes, oauth_state cookie absent |
| `?token=` not logged | Check browser console — no token logged |

## Success Criteria

- All manual test checkboxes pass
- `dotnet build` and `npm run build` both succeed with 0 errors
- New Google user → DB row created with correct fields
- Existing email → no duplicate row
- All error codes map to correct user-facing messages
- Google button visible and correctly styled on login page
