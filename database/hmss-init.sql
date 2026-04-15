

-- Create database (run separately if needed)
CREATE DATABASE HmssDb;
GO
USE HmssDb;
GO

-- ============================================================
-- DROP EXISTING TABLES (reverse dependency order)
-- ============================================================
IF OBJECT_ID('dbo.ChatMessages', 'U') IS NOT NULL DROP TABLE dbo.ChatMessages;
IF OBJECT_ID('dbo.Conversations', 'U') IS NOT NULL DROP TABLE dbo.Conversations;
IF OBJECT_ID('dbo.RentalRequests', 'U') IS NOT NULL DROP TABLE dbo.RentalRequests;
IF OBJECT_ID('dbo.RoomListings', 'U') IS NOT NULL DROP TABLE dbo.RoomListings;
IF OBJECT_ID('dbo.OwnerVerifications', 'U') IS NOT NULL DROP TABLE dbo.OwnerVerifications;
IF OBJECT_ID('dbo.Properties', 'U') IS NOT NULL DROP TABLE dbo.Properties;
IF OBJECT_ID('dbo.UserAccounts', 'U') IS NOT NULL DROP TABLE dbo.UserAccounts;
GO

-- ============================================================
-- 1. UserAccounts
-- ============================================================
CREATE TABLE dbo.UserAccounts (
    UserId          UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    FullName        NVARCHAR(256)    NOT NULL,
    Email           NVARCHAR(256)    NOT NULL,
    Phone           NVARCHAR(50)     NOT NULL,
    PasswordHash    NVARCHAR(512)    NOT NULL,
    Role            NVARCHAR(20)     NOT NULL,
    AccountStatus   NVARCHAR(20)     NOT NULL DEFAULT 'Active',
    CreatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_UserAccounts_Email UNIQUE (Email),
    CONSTRAINT CK_UserAccount_Role CHECK (Role IN ('Tenant', 'Owner', 'SystemAdmin')),
    CONSTRAINT CK_UserAccount_AccountStatus CHECK (AccountStatus IN ('Active', 'Suspended', 'Disabled'))
);
GO

-- ============================================================
-- 2. Properties
-- ============================================================
CREATE TABLE dbo.Properties (
    PropertyId      UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    OwnerId         UNIQUEIDENTIFIER NOT NULL,
    Name            NVARCHAR(256)    NOT NULL,
    Address         NVARCHAR(512)    NOT NULL,
    MapLocation     NVARCHAR(512)    NULL,
    Description     NVARCHAR(MAX)    NULL,
    GeneralPolicies NVARCHAR(MAX)    NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Properties_UserAccounts FOREIGN KEY (OwnerId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE NO ACTION
);
GO

-- ============================================================
-- 3. RoomListings
-- ============================================================
CREATE TABLE dbo.RoomListings (
    ListingId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    PropertyId      UNIQUEIDENTIFIER NOT NULL,
    Title           NVARCHAR(256)    NOT NULL,
    Description     NVARCHAR(MAX)    NULL,
    Price           DECIMAL(18,2)    NOT NULL,
    Capacity        INT              NOT NULL DEFAULT 1,
    Amenities       NVARCHAR(MAX)    NULL,      -- JSON array string
    AvailableFrom   DATE             NOT NULL,
    FurnishedStatus NVARCHAR(30)     NOT NULL,
    PrivateWCStatus NVARCHAR(20)     NOT NULL,
    ImagesRef       NVARCHAR(MAX)    NULL,      -- JSON array of URLs
    Status          NVARCHAR(30)     NOT NULL DEFAULT 'Draft',
    CreatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    PublishedAt     DATETIME2        NULL,

    CONSTRAINT FK_RoomListings_Properties FOREIGN KEY (PropertyId)
        REFERENCES dbo.Properties (PropertyId) ON DELETE CASCADE,
    CONSTRAINT CK_RoomListing_FurnishedStatus CHECK (FurnishedStatus IN ('FullyFurnished', 'PartiallyFurnished', 'Unfurnished')),
    CONSTRAINT CK_RoomListing_PrivateWCStatus CHECK (PrivateWCStatus IN ('Private', 'Shared', 'None')),
    CONSTRAINT CK_RoomListing_Status CHECK (Status IN ('Draft', 'PublishedAvailable', 'Locked', 'Hidden', 'Archived'))
);
GO

-- ============================================================
-- 4. RentalRequests
-- ============================================================
CREATE TABLE dbo.RentalRequests (
    RequestId               UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    ListingId               UNIQUEIDENTIFIER NOT NULL,
    TenantId                UNIQUEIDENTIFIER NOT NULL,
    MoveInDate              DATE             NOT NULL,
    ExpectedRentalDuration  INT              NOT NULL,  -- months
    OccupantCount           INT              NOT NULL DEFAULT 1,
    OccupationCategory      NVARCHAR(MAX)    NULL,
    BudgetExpectation       DECIMAL(18,2)    NULL,
    ContactPhone            NVARCHAR(50)     NOT NULL,
    PreferredContactMethod  NVARCHAR(20)     NOT NULL,
    SpecialNotes            NVARCHAR(MAX)    NULL,
    Status                  NVARCHAR(30)     NOT NULL DEFAULT 'Pending',
    SubmittedAt             DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    DecidedAt               DATETIME2        NULL,

    CONSTRAINT FK_RentalRequests_RoomListings FOREIGN KEY (ListingId)
        REFERENCES dbo.RoomListings (ListingId) ON DELETE NO ACTION,
    CONSTRAINT FK_RentalRequests_UserAccounts FOREIGN KEY (TenantId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE NO ACTION,
    CONSTRAINT CK_RentalRequest_Status CHECK (Status IN ('Pending', 'Accepted', 'Rejected', 'CancelledByTenant', 'RevokedByOwner'))
);
GO

-- ============================================================
-- 5. Conversations
-- ============================================================
CREATE TABLE dbo.Conversations (
    ConversationId  UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    OwnerId         UNIQUEIDENTIFIER NOT NULL,
    TenantId        UNIQUEIDENTIFIER NOT NULL,
    RequestId       UNIQUEIDENTIFIER NULL,
    CreatedAt       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Conversations_Owner FOREIGN KEY (OwnerId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Conversations_Tenant FOREIGN KEY (TenantId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Conversations_Request FOREIGN KEY (RequestId)
        REFERENCES dbo.RentalRequests (RequestId) ON DELETE NO ACTION
);
GO

-- Unique: one conversation per (Owner, Tenant, Request) when RequestId IS NOT NULL
CREATE UNIQUE INDEX UX_Conversations_OwnerTenantRequest
    ON dbo.Conversations (OwnerId, TenantId, RequestId)
    WHERE [RequestId] IS NOT NULL;
GO

-- Unique: one conversation per (Owner, Tenant) when RequestId IS NULL (direct chat)
CREATE UNIQUE INDEX UX_Conversations_OwnerTenant_DirectChat
    ON dbo.Conversations (OwnerId, TenantId)
    WHERE [RequestId] IS NULL;
GO

-- ============================================================
-- 6. ChatMessages
-- ============================================================
CREATE TABLE dbo.ChatMessages (
    MessageId       UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    RequestId       UNIQUEIDENTIFIER NULL,
    ConversationId  UNIQUEIDENTIFIER NULL,
    SenderId        UNIQUEIDENTIFIER NOT NULL,
    Body            NVARCHAR(2000)   NOT NULL,
    SentAt          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ChatMessages_Request FOREIGN KEY (RequestId)
        REFERENCES dbo.RentalRequests (RequestId) ON DELETE NO ACTION,
    CONSTRAINT FK_ChatMessages_Conversation FOREIGN KEY (ConversationId)
        REFERENCES dbo.Conversations (ConversationId) ON DELETE NO ACTION,
    CONSTRAINT FK_ChatMessages_Sender FOREIGN KEY (SenderId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE NO ACTION
);
GO

CREATE INDEX IX_ChatMessages_RequestId_SentAt ON dbo.ChatMessages (RequestId, SentAt);
CREATE INDEX IX_ChatMessages_ConversationId_SentAt ON dbo.ChatMessages (ConversationId, SentAt);
GO

-- ============================================================
-- 7. OwnerVerifications
-- ============================================================
CREATE TABLE dbo.OwnerVerifications (
    VerificationId      UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    OwnerId             UNIQUEIDENTIFIER NOT NULL,
    PersonalInformation NVARCHAR(MAX)    NULL,
    IdDocumentRef       NVARCHAR(1024)   NOT NULL,
    SupportingDocsRef   NVARCHAR(MAX)    NULL,      -- JSON array
    Status              NVARCHAR(20)     NOT NULL DEFAULT 'PendingReview',
    SubmittedAt         DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    ReviewedAt          DATETIME2        NULL,
    ReviewNote          NVARCHAR(MAX)    NULL,

    CONSTRAINT FK_OwnerVerifications_UserAccounts FOREIGN KEY (OwnerId)
        REFERENCES dbo.UserAccounts (UserId) ON DELETE CASCADE,
    CONSTRAINT CK_OwnerVerification_Status CHECK (Status IN ('PendingReview', 'Verified', 'Rejected'))
);
GO


-- ============================================================
-- SEED DATA
-- ============================================================

DECLARE @seedDate DATETIME2 = '2026-01-01T00:00:00Z';

-- ── Password hashes (BCrypt, pre-computed) ──
-- Admin@123!
DECLARE @hashAdmin NVARCHAR(512) = '$2a$11$K5wKXqkJ7VHJh6QQVZ9Y0OnWdYC1I5kX4IjBvJqYX8U1JV3FS4vKi';
-- Owner@123!
DECLARE @hashOwner NVARCHAR(512) = '$2a$11$K5wKXqkJ7VHJh6QQVZ9Y0OKrNfLz8g9uMQZJ5xV3xY2W1U0R4T6e';
-- Tenant@123!
DECLARE @hashTenant NVARCHAR(512) = '$2a$11$K5wKXqkJ7VHJh6QQVZ9Y0OQmN4Lp7h0vXRbK6wY4zA3X2V1S5U7f';

-- NOTE: The BCrypt hashes above are placeholders. Replace them with actual
-- hashes generated by your application, or let EF Core migrations handle seeding.
-- You can generate them in C#: BCrypt.Net.BCrypt.HashPassword("Admin@123!")

-- ============================================================
-- UserAccounts (1 Admin + 5 Owners + 1 Tenant = 7 users)
-- ============================================================
INSERT INTO dbo.UserAccounts (UserId, FullName, Email, Phone, PasswordHash, Role, AccountStatus, CreatedAt) VALUES
('00000000-0000-0000-0000-000000000001', N'System Administrator', 'admin@hmss.local',  '0000000000', @hashAdmin,  'SystemAdmin', 'Active', @seedDate),
('00000000-0000-0000-0000-000000000002', N'Demo Owner',          'owner@hmss.local',   '0901234567', @hashOwner,  'Owner',       'Active', @seedDate),
('00000000-0000-0000-0000-000000000003', N'Demo Tenant',         'tenant@hmss.local',  '0912345678', @hashTenant, 'Tenant',      'Active', @seedDate),
('00000000-0000-0000-0000-000000000004', N'Nguyen Van Minh',     'owner2@hmss.local',  '0902345678', @hashOwner,  'Owner',       'Active', @seedDate),
('00000000-0000-0000-0000-000000000005', N'Tran Thi Lan',        'owner3@hmss.local',  '0903456789', @hashOwner,  'Owner',       'Active', @seedDate),
('00000000-0000-0000-0000-000000000006', N'Le Hoang Nam',        'owner4@hmss.local',  '0904567890', @hashOwner,  'Owner',       'Active', @seedDate),
('00000000-0000-0000-0000-000000000007', N'Pham Thi Thu',        'owner5@hmss.local',  '0905678901', @hashOwner,  'Owner',       'Active', @seedDate);
GO

-- ============================================================
-- Properties (6 properties)
-- ============================================================
DECLARE @seedDate DATETIME2 = '2026-01-01T00:00:00Z';

INSERT INTO dbo.Properties (PropertyId, OwnerId, Name, Address, MapLocation, Description, GeneralPolicies, CreatedAt, UpdatedAt) VALUES
('00000000-0000-0000-0000-000000000010',
 '00000000-0000-0000-0000-000000000002',
 N'Sunrise Hostel',
 N'123 Nguyen Hue Street, District 1, Ho Chi Minh City',
 NULL,
 N'A comfortable hostel located in the heart of the city with easy access to transportation.',
 N'No smoking indoors. Quiet hours from 10 PM to 7 AM. Guests must register at front desk.',
 @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000011',
 '00000000-0000-0000-0000-000000000004',
 N'Central Park Residences',
 N'45 Tran Hung Dao Street, Hoan Kiem District, Hanoi',
 NULL,
 N'Modern residences near Hoan Kiem Lake with excellent public transport links.',
 N'No parties or loud music. Pets not allowed. Monthly electricity billed separately.',
 @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000012',
 '00000000-0000-0000-0000-000000000005',
 N'Saigon Garden Hostel',
 N'78 Bui Vien Street, District 1, Ho Chi Minh City',
 NULL,
 N'Vibrant hostel on the famous backpacker street. Walking distance to Ben Thanh Market.',
 N'Curfew at midnight. No cooking in rooms. ID required at check-in.',
 @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000013',
 '00000000-0000-0000-0000-000000000005',
 N'Beachside Retreat',
 N'12 Vo Nguyen Giap Street, Son Tra District, Da Nang',
 NULL,
 N'Peaceful guesthouse 5 minutes walk from My Khe Beach with sea breeze views.',
 N'No sandy shoes inside. Towels provided. Checkout by 11 AM.',
 @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000014',
 '00000000-0000-0000-0000-000000000006',
 N'Mountain View Lodge',
 N'34 Phan Dinh Phung Street, Da Lat City, Lam Dong',
 NULL,
 N'Cozy highland lodge surrounded by pine forests. Cool climate year-round.',
 N'Blankets and heater provided. No campfires on premises. Respect quiet hours 9 PM onward.',
 @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000015',
 '00000000-0000-0000-0000-000000000007',
 N'University Quarter House',
 N'56 Nguyen Tat Thanh Street, District 4, Ho Chi Minh City',
 NULL,
 N'Budget-friendly house near HCMC University of Technology. Ideal for students.',
 N'Students preferred. Study quiet hours from 8 PM to 6 AM. Shared kitchen available.',
 @seedDate, @seedDate);
GO

-- ============================================================
-- RoomListings (12 listings, 2 per property)
-- ============================================================
DECLARE @seedDate DATETIME2 = '2026-01-01T00:00:00Z';

INSERT INTO dbo.RoomListings (ListingId, PropertyId, Title, Description, Price, Capacity, Amenities, AvailableFrom, FurnishedStatus, PrivateWCStatus, ImagesRef, Status, CreatedAt, UpdatedAt, PublishedAt) VALUES
-- Sunrise Hostel (HCMC)
('00000000-0000-0000-0000-000000000020',
 '00000000-0000-0000-0000-000000000010',
 N'Cozy Single Room – City View',
 N'A bright single room on the 3rd floor with a window overlooking the city.',
 3500000.00, 1,
 '["WiFi","Air Conditioning","Water Heater","Desk"]',
 '2026-02-01', 'FullyFurnished', 'Private',
 '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000021',
 '00000000-0000-0000-0000-000000000010',
 N'Shared Double Room – Budget Stay',
 N'A spacious double room shared with one other tenant. Great for budget travelers.',
 2200000.00, 2,
 '["WiFi","Fan","Shared Kitchen"]',
 '2026-02-01', 'PartiallyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

-- Central Park Residences (Hanoi)
('00000000-0000-0000-0000-000000000022',
 '00000000-0000-0000-0000-000000000011',
 N'Modern Studio – Hoan Kiem View',
 N'Bright studio apartment with large windows and lake view on the 5th floor.',
 5500000.00, 1,
 '["WiFi","Air Conditioning","Private Bathroom","Mini Fridge","Smart TV"]',
 '2026-02-01', 'FullyFurnished', 'Private',
 '["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000023',
 '00000000-0000-0000-0000-000000000011',
 N'Twin Bedroom – City Centre',
 N'Twin beds, ideal for two colleagues or travel partners. Very central location.',
 4200000.00, 2,
 '["WiFi","Air Conditioning","Wardrobe","Hot Water"]',
 '2026-03-01', 'FullyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1585128792020-803d29415281?w=800","https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

-- Saigon Garden Hostel (Bui Vien)
('00000000-0000-0000-0000-000000000024',
 '00000000-0000-0000-0000-000000000012',
 N'Private Room – Backpacker Hub',
 N'En-suite private room in the heart of the backpacker district. Vibrant nightlife outside.',
 3800000.00, 1,
 '["WiFi","Air Conditioning","En-suite Bathroom","Locker"]',
 '2026-02-15', 'FullyFurnished', 'Private',
 '["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800","https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000025',
 '00000000-0000-0000-0000-000000000012',
 N'Dorm Bed – Mixed 6-Bed Room',
 N'Comfortable bunk bed in a clean mixed dorm. Lockers and individual reading lights included.',
 1200000.00, 1,
 '["WiFi","Fan","Locker","Reading Light","Shared Bathroom"]',
 '2026-02-01', 'PartiallyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

-- Beachside Retreat (Da Nang)
('00000000-0000-0000-0000-000000000026',
 '00000000-0000-0000-0000-000000000013',
 N'Sea Breeze Double Room',
 N'Airy double room with ocean breeze. Just a short stroll to My Khe Beach.',
 4500000.00, 2,
 '["WiFi","Air Conditioning","Beach Towels","Balcony","Hot Water"]',
 '2026-03-01', 'FullyFurnished', 'Private',
 '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000027',
 '00000000-0000-0000-0000-000000000013',
 N'Budget Single – Ground Floor',
 N'Simple, clean single room for solo travellers on a budget near the beach.',
 2500000.00, 1,
 '["WiFi","Fan","Shared Bathroom"]',
 '2026-02-01', 'PartiallyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800","https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

-- Mountain View Lodge (Da Lat)
('00000000-0000-0000-0000-000000000028',
 '00000000-0000-0000-0000-000000000014',
 N'Pine Forest Suite',
 N'Romantic suite with large windows overlooking pine forests. Fireplace included.',
 6000000.00, 2,
 '["WiFi","Heater","Fireplace","Private Bathroom","Coffee Maker","Garden View"]',
 '2026-02-01', 'FullyFurnished', 'Private',
 '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800","https://images.unsplash.com/photo-1585128792020-803d29415281?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-000000000029',
 '00000000-0000-0000-0000-000000000014',
 N'Cosy Highland Single',
 N'Warm single room with thick blankets and mountain air. Perfect for a quiet retreat.',
 3200000.00, 1,
 '["WiFi","Heater","Hot Water","Desk"]',
 '2026-03-01', 'FullyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

-- University Quarter House (HCMC)
('00000000-0000-0000-0000-00000000002A',
 '00000000-0000-0000-0000-000000000015',
 N'Student Room – Near HCMC University',
 N'Quiet study room ideal for university students. Desk, bookshelf, and fast WiFi provided.',
 2800000.00, 1,
 '["WiFi","Air Conditioning","Desk","Bookshelf","Hot Water"]',
 '2026-02-01', 'FullyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate),

('00000000-0000-0000-0000-00000000002B',
 '00000000-0000-0000-0000-000000000015',
 N'Shared Room – 2 Students',
 N'Affordable shared room for two students. Separate study desks and personal storage.',
 1800000.00, 2,
 '["WiFi","Fan","2 Desks","Shared Kitchen","Laundry Access"]',
 '2026-02-01', 'PartiallyFurnished', 'Shared',
 '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800"]',
 'PublishedAvailable', @seedDate, @seedDate, @seedDate);
GO

-- ============================================================
-- OwnerVerifications (all 5 owners verified)
-- ============================================================
DECLARE @seedDate DATETIME2 = '2026-01-01T00:00:00Z';

INSERT INTO dbo.OwnerVerifications (VerificationId, OwnerId, PersonalInformation, IdDocumentRef, SupportingDocsRef, Status, SubmittedAt, ReviewedAt, ReviewNote) VALUES
('00000000-0000-0000-0000-000000000030',
 '00000000-0000-0000-0000-000000000002',
 N'Demo Owner – ID verified for seeding purposes.',
 'seed/id-document-owner1.pdf', NULL, 'Verified', @seedDate, @seedDate, N'Auto-approved via seed data.'),

('00000000-0000-0000-0000-000000000031',
 '00000000-0000-0000-0000-000000000004',
 N'Nguyen Van Minh – ID verified for seeding purposes.',
 'seed/id-document-owner2.pdf', NULL, 'Verified', @seedDate, @seedDate, N'Auto-approved via seed data.'),

('00000000-0000-0000-0000-000000000032',
 '00000000-0000-0000-0000-000000000005',
 N'Tran Thi Lan – ID verified for seeding purposes.',
 'seed/id-document-owner3.pdf', NULL, 'Verified', @seedDate, @seedDate, N'Auto-approved via seed data.'),

('00000000-0000-0000-0000-000000000033',
 '00000000-0000-0000-0000-000000000006',
 N'Le Hoang Nam – ID verified for seeding purposes.',
 'seed/id-document-owner4.pdf', NULL, 'Verified', @seedDate, @seedDate, N'Auto-approved via seed data.'),

('00000000-0000-0000-0000-000000000034',
 '00000000-0000-0000-0000-000000000007',
 N'Pham Thi Thu – ID verified for seeding purposes.',
 'seed/id-document-owner5.pdf', NULL, 'Verified', @seedDate, @seedDate, N'Auto-approved via seed data.');
GO


PRINT 'HMSS database initialized successfully.';
GO
