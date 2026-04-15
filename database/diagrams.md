# HMSS Diagrams (Mermaid)

Paste each code block into https://mermaid.live to render and export as PNG/SVG.

---

## 1. Use Case Diagram - Visitor

```mermaid
graph LR
    V((Visitor))
    V --> UC1[Browse Room Listings]
    V --> UC2[Search Rooms by Filters]
    V --> UC3[View Room Details with Map]
    V --> UC4[Register Account - Tenant/Owner]
```

## 2. Use Case Diagram - Tenant

```mermaid
graph LR
    T((Tenant))
    T --> UC6[Log In / Log Out]
    T --> UC6b[Log In with Google OAuth]
    T --> UC7[Search and Browse Rooms]
    T --> UC8[View Room Details]
    T --> UC9[Submit Rental Request]
    T --> UC10[View My Rental Requests]
    T --> UC11[View Request Details]
    T --> UC12[Cancel Pending Request]
    T --> UC13[Chat with Owner - Request Detail]
    T --> UC14[Contact Owner - Room Detail]
    T --> UC15[View Conversations - Chat Page]
    T --> UC16[Receive Notifications]
```

## 3. Use Case Diagram - Owner

```mermaid
graph LR
    O((Owner))
    O --> UC17[Log In / Log Out]
    O --> UC18[Create / Edit / View Properties]
    O --> UC19[Create / Edit Room Listings]
    O --> UC20[Upload Room Images]
    O --> UC21[Publish Listing]
    O --> UC22[Hide / Show Listing]
    O --> UC23[Archive Listing]
    O --> UC24[Submit Owner Verification]
    O --> UC25[View Rental Requests for Room]
    O --> UC26[Accept / Reject Rental Request]
    O --> UC27[Revoke Accepted Request]
    O --> UC28[View Categorized Chat Inbox]
    O --> UC29[Chat with Tenant]
    O --> UC30[View Accepted Arrangements]
    O --> UC31[Reopen Listing]
    O --> UC32[Receive Notifications]
```

## 4. Use Case Diagram - System Admin

```mermaid
graph LR
    A((System Admin))
    A --> UC33[Log In / Log Out]
    A --> UC34[View All Users]
    A --> UC35[Suspend / Enable / Disable User]
    A --> UC36[View Pending Owner Verifications]
    A --> UC37[Approve / Reject Verification]
    A --> UC38[View All Visible Listings]
    A --> UC39[Disable Inappropriate Listing]
```

---

## 5. Screen Flow Diagram

```mermaid
graph TD
    HOME[Home Page]
    LOGIN[Login Page]
    REG[Register Page]
    GOOGLE[Google OAuth Callback]
    SEARCH[Search Rooms]
    ROOM[Room Detail]
    REQ_FORM[Submit Rental Request]
    CONTACT[Contact Owner]

    HOME --> LOGIN
    HOME --> REG
    HOME --> SEARCH
    LOGIN --> GOOGLE
    SEARCH --> ROOM
    ROOM --> REQ_FORM
    ROOM --> CONTACT

    subgraph Tenant
        T_REQ[My Requests]
        T_REQ_D[Request Detail]
        T_CHAT[Tenant Chat Page]
        T_REQ --> T_REQ_D
        T_REQ_D --> T_CHAT_BOX[Chat in Request]
    end

    subgraph Owner
        O_PROP[My Properties]
        O_PROP_NEW[Create Property]
        O_PROP_EDIT[Edit Property]
        O_LIST[Listings]
        O_LIST_NEW[Create Listing]
        O_LIST_EDIT[Edit Listing]
        O_PUB[Publish / Hide / Archive]
        O_ROOM_REQ[Room Requests]
        O_ACCEPT[Accept / Reject]
        O_CHAT[Owner Chat Page]
        O_ARRANGE[Arrangements]
        O_VERIFY[Owner Verification]

        O_PROP --> O_PROP_NEW
        O_PROP --> O_PROP_EDIT
        O_PROP --> O_LIST
        O_LIST --> O_LIST_NEW
        O_LIST --> O_LIST_EDIT
        O_LIST --> O_PUB
        O_PUB --> O_ROOM_REQ
        O_ROOM_REQ --> O_ACCEPT
        O_ACCEPT --> O_CHAT
    end

    subgraph Admin
        A_USERS[User Management]
        A_USER_D[User Detail]
        A_VERIF[Verification Review]
        A_VERIF_D[Verification Detail]
        A_LISTINGS[Listing Moderation]
        A_LIST_D[Listing Detail]

        A_USERS --> A_USER_D
        A_VERIF --> A_VERIF_D
        A_LISTINGS --> A_LIST_D
    end

    LOGIN -->|Tenant| T_REQ
    LOGIN -->|Owner| O_PROP
    LOGIN -->|Admin| A_USERS
    CONTACT --> T_CHAT
```

---

## 6. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    UserAccounts {
        uniqueidentifier UserId PK
        nvarchar FullName
        nvarchar Email UK
        nvarchar Phone
        nvarchar PasswordHash
        nvarchar Role "Tenant | Owner | SystemAdmin"
        nvarchar AccountStatus "Active | Suspended | Disabled"
        datetime2 CreatedAt
    }

    Properties {
        uniqueidentifier PropertyId PK
        uniqueidentifier OwnerId FK
        nvarchar Name
        nvarchar Address
        nvarchar MapLocation "nullable"
        nvarchar Description "nullable"
        nvarchar GeneralPolicies "nullable"
        datetime2 CreatedAt
        datetime2 UpdatedAt
    }

    RoomListings {
        uniqueidentifier ListingId PK
        uniqueidentifier PropertyId FK
        nvarchar Title
        nvarchar Description "nullable"
        decimal Price
        int Capacity
        nvarchar Amenities "JSON array, nullable"
        date AvailableFrom
        nvarchar FurnishedStatus "FullyFurnished | PartiallyFurnished | Unfurnished"
        nvarchar PrivateWCStatus "Private | Shared | None"
        nvarchar ImagesRef "JSON array of URLs, nullable"
        nvarchar Status "Draft | PublishedAvailable | Locked | Hidden | Archived"
        datetime2 CreatedAt
        datetime2 UpdatedAt
        datetime2 PublishedAt "nullable"
    }

    RentalRequests {
        uniqueidentifier RequestId PK
        uniqueidentifier ListingId FK
        uniqueidentifier TenantId FK
        date MoveInDate
        int ExpectedRentalDuration "months"
        int OccupantCount
        nvarchar OccupationCategory "nullable"
        decimal BudgetExpectation "nullable"
        nvarchar ContactPhone
        nvarchar PreferredContactMethod "Phone | Email | WhatsApp"
        nvarchar SpecialNotes "nullable"
        nvarchar Status "Pending | Accepted | Rejected | CancelledByTenant | RevokedByOwner"
        datetime2 SubmittedAt
        datetime2 DecidedAt "nullable"
    }

    Conversations {
        uniqueidentifier ConversationId PK
        uniqueidentifier OwnerId FK
        uniqueidentifier TenantId FK
        uniqueidentifier RequestId FK "nullable"
        datetime2 CreatedAt
    }

    ChatMessages {
        uniqueidentifier MessageId PK
        uniqueidentifier RequestId FK "nullable"
        uniqueidentifier ConversationId FK "nullable"
        uniqueidentifier SenderId FK
        nvarchar Body "max 2000 chars"
        datetime2 SentAt
    }

    OwnerVerifications {
        uniqueidentifier VerificationId PK
        uniqueidentifier OwnerId FK
        nvarchar PersonalInformation "nullable"
        nvarchar IdDocumentRef
        nvarchar SupportingDocsRef "JSON, nullable"
        nvarchar Status "PendingReview | Verified | Rejected"
        datetime2 SubmittedAt
        datetime2 ReviewedAt "nullable"
        nvarchar ReviewNote "nullable"
    }

    UserAccounts ||--o{ Properties : "owns"
    UserAccounts ||--o{ RentalRequests : "submits"
    UserAccounts ||--o{ OwnerVerifications : "verifies"
    UserAccounts ||--o{ Conversations : "owner"
    UserAccounts ||--o{ Conversations : "tenant"
    UserAccounts ||--o{ ChatMessages : "sends"
    Properties ||--o{ RoomListings : "contains"
    RoomListings ||--o{ RentalRequests : "receives"
    RentalRequests ||--o{ Conversations : "linked to"
    Conversations ||--o{ ChatMessages : "contains"
    RentalRequests ||--o{ ChatMessages : "legacy scope"
```

---

## 7. Listing Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft : Create Listing
    Draft --> PublishedAvailable : Publish (owner verified)
    PublishedAvailable --> Locked : Accept Request
    PublishedAvailable --> Hidden : Hide
    PublishedAvailable --> Archived : Archive
    Locked --> PublishedAvailable : Revoke / Reopen
    Hidden --> PublishedAvailable : Show
    Draft --> Archived : Archive
```

## 8. Rental Request Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending : Submit Request
    Pending --> Accepted : Owner Accepts
    Pending --> Rejected : Owner Rejects
    Pending --> CancelledByTenant : Tenant Cancels
    Accepted --> RevokedByOwner : Owner Revokes
```

## 9. Account Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Active : Register
    Active --> Suspended : Suspend
    Active --> Disabled : Disable
    Suspended --> Active : Enable
    Suspended --> Disabled : Disable
    Disabled --> Active : Enable
```

## 10. Owner Verification Status State Machine

```mermaid
stateDiagram-v2
    [*] --> PendingReview : Submit Verification
    PendingReview --> Verified : Admin Approves
    PendingReview --> Rejected : Admin Rejects
```

---

## 11. System Architecture

```mermaid
graph TB
    subgraph Client
        NEXT[Next.js 16 - React 19 + TypeScript]
    end

    subgraph Backend
        API[ASP.NET Core .NET 8 Web API]
        HUB[SignalR Hub - Real-time Chat]
    end

    subgraph Database
        MSSQL[(SQL Server)]
    end

    subgraph External
        GOOGLE_AUTH[Google OAuth 2.0]
        GOOGLE_MAPS[Google Maps APIs]
        CLOUD[Cloud Storage - Images]
        SMTP[SMTP Email]
    end

    NEXT -->|REST API + JWT| API
    NEXT -->|WebSocket| HUB
    API --> MSSQL
    HUB --> MSSQL
    API --> GOOGLE_AUTH
    API --> CLOUD
    API --> SMTP
    NEXT --> GOOGLE_MAPS
```
