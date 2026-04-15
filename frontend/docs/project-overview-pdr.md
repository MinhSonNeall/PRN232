# HMSS — Project Overview (PDR)

## Product Description

**HMSS** (Hotel Management & Search System) — web app for hostel/hotel room management in Vietnam. Connects property owners with tenants looking for rooms.

## Core Features

### Visitor (Public)
- Browse and search room listings by location, price, amenities
- View room details with images, pricing, policies
- Register as Owner or Tenant

### Tenant
- Submit rental requests with move-in date, duration, budget
- Track request status (Pending → Accepted/Rejected)
- Cancel pending requests
- Receive notifications on request status changes

### Owner
- Register and verify identity (document upload)
- Create/manage properties with address, description, policies
- Create/manage room listings under properties (title, price, capacity, amenities, images)
- Publish/hide/archive listings
- Review tenant rental requests (accept/reject)
- Receive notifications on new rental requests

### System Admin
- Manage user accounts (suspend/enable/disable)
- Review owner verifications (approve/reject)

## User Roles

| Role | Access |
|------|--------|
| Visitor | Search rooms, view details, register |
| Tenant | Submit/cancel rental requests, notifications |
| Owner | CRUD properties & listings, review requests, notifications |
| SystemAdmin | Manage users & verifications |

## Business Rules

1. Only verified owners can publish listings
2. Tenants can only request published-available rooms
3. Accepting a request locks the listing (prevents new requests)
4. Owner can revoke accepted requests (unlocks listing)
5. Tenants can cancel only pending requests
6. Account status follows state machine (Active ↔ Suspended ↔ Disabled)

## Non-Functional Requirements

- JWT-based authentication with role-based authorization
- Responsive UI (mobile + desktop)
- Real-time-like notifications via polling (30s interval)
- Vietnamese market focus (VND currency, Vietnam locations)
