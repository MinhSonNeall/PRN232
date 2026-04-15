# HMSS — System Architecture

## Overview

HMSS (Hotel Management & Search System) — full-stack hostel/hotel room management app for Vietnam market. Owners list properties & rooms; tenants search, view, and submit rental requests.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core .NET 8, EF Core, SQL Server |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Auth | JWT (cookie + localStorage), BCrypt password hashing |
| External | Cloud Storage (images), Email gateway, Google Maps |

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                 │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Auth   │ │ Visitor  │ │  Owner   │ │ Tenant  │  │
│  │ Pages   │ │  Pages   │ │  Pages   │ │  Pages  │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬────┘  │
│       └───────────┴────────────┴─────────────┘       │
│                    API Client (fetch)                 │
│                    Middleware (JWT)                   │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP/JSON
┌──────────────────────▼───────────────────────────────┐
│                  BACKEND (ASP.NET Core)               │
│  ┌────────────┐                                      │
│  │ Controllers│ ← 16 REST endpoints                  │
│  └─────┬──────┘                                      │
│  ┌─────▼──────┐                                      │
│  │   Logic    │ ← Business rules, state machines     │
│  └─────┬──────┘                                      │
│  ┌─────▼──────┐  ┌───────────┐  ┌──────────┐        │
│  │ Repository │  │  Services │  │ Gateways │        │
│  │  (EF Core) │  │ (Notif,   │  │ (Storage,│        │
│  │            │  │  Search)  │  │  Email,  │        │
│  └─────┬──────┘  └───────────┘  │  Maps)   │        │
│        │                        └──────────┘        │
└────────┼────────────────────────────────────────────┘
         │
┌────────▼────────┐
│   SQL Server    │
│  (5 tables)     │
└─────────────────┘
```

## Database Schema (5 Tables)

### Entity Relationship

```
UserAccounts (1) ──< Properties (1) ──< RoomListings (1) ──< RentalRequests
     │                                                            │
     │                                                            │
     └──< OwnerVerifications                 UserAccounts (1) ────┘
```

### Tables

| Table | Description | Key Relationships |
|-------|------------|-------------------|
| **UserAccounts** | Users (Tenant, Owner, SystemAdmin) | PK: UserId |
| **Properties** | Hostel/hotel properties | FK: OwnerId → UserAccounts (NO ACTION) |
| **RoomListings** | Individual room listings within properties | FK: PropertyId → Properties (CASCADE) |
| **RentalRequests** | Tenant room rental requests | FK: ListingId → RoomListings (NO ACTION), TenantId → UserAccounts (NO ACTION) |
| **OwnerVerifications** | Owner identity verification records | FK: OwnerId → UserAccounts (CASCADE) |

### State Machines

**UserAccount.AccountStatus:** Active ↔ Suspended ↔ Disabled

**RoomListing.Status:** Draft → PublishedAvailable ↔ Hidden, PublishedAvailable → Locked → PublishedAvailable, Any → Archived

**RentalRequest.Status:** Pending → Accepted | Rejected | CancelledByTenant, Accepted → RevokedByOwner

**OwnerVerification.Status:** PendingReview → Verified | Rejected

## Backend Architecture (Layered)

```
Controllers (16)     → HTTP request handling, input validation
Logic (9 classes)    → Business rules, orchestration
Repositories (5)     → Data access abstraction (EF Core)
Services             → Notification, Search Matching, Property, Account Status
Gateways             → Cloud Storage, Email, Google Maps
Entities (5+1)       → Domain models with state machines
```

### Key Controllers

| Controller | Purpose |
|-----------|---------|
| AuthController | Login, Register, JWT token |
| PropertyController | CRUD owner properties |
| RoomListingController | CRUD room listings |
| RoomSearchController | Public room search |
| SubmitRentalRequestController | Tenant submits request |
| TenantRentalRequestController | Tenant views/cancels requests |
| ReviewRentalRequestController | Owner accepts/rejects requests |
| OwnerVerificationController | Owner submits verification |
| ReviewVerificationController | Admin reviews verifications |
| ControlListingController | Publish/hide/archive listings |
| UserAccountAdminController | Admin manages user accounts |
| ViewRoomController | Public room detail view |

## Frontend Architecture

### Route Structure (Next.js App Router)

```
src/app/
├── (auth)/              # Auth pages (login, register)
│   ├── login/
│   └── register/
├── (visitor)/           # Public pages
│   ├── room/[listingId] # Room detail
│   └── search/          # Room search
├── owner/               # Owner dashboard
│   ├── property/        # Properties + nested listings (CRUD)
│   ├── listing/
│   │   ├── new/         # Create listing
│   │   └── [listingId]/edit/  # Edit listing
│   └── requests/room/[roomId]/ # View & manage requests
├── tenant/              # Tenant dashboard
│   └── requests/        # View own requests
└── admin/               # Admin dashboard
```

### Key Patterns

- **Auth sync**: Custom `hmss-auth-change` event for cross-component state sync
- **JWT middleware**: Cookie-based JWT for route protection, localStorage for client state
- **Polling notifications**: NotificationBell polls every 30s, localStorage for read state
- **Accordion UI**: Properties page shows expandable property cards with nested listing cards

## Authentication Flow

1. User logs in → Backend returns JWT token
2. Frontend stores token in cookie (for middleware) + localStorage (for client)
3. Middleware reads JWT, extracts role, protects routes
4. `useAuth()` hook syncs auth state across components via custom event
5. Post-login redirect: role-based (Owner → /owner/property, Tenant → /tenant/requests)

## Seed Data

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 7 | 1 admin, 5 owners, 1 tenant |
| Properties | 6 | HCMC, Hanoi, Da Nang, Da Lat |
| Room Listings | 12 | 2 per property, all PublishedAvailable |
| Owner Verifications | 5 | All verified |
