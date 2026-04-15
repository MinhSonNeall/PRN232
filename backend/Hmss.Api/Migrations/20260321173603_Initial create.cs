using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hmss.Api.Migrations
{
    /// <inheritdoc />
    public partial class Initialcreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AccountStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.UserId);
                    table.CheckConstraint("CK_UserAccount_AccountStatus", "AccountStatus IN ('Active', 'Suspended', 'Disabled')");
                    table.CheckConstraint("CK_UserAccount_Role", "Role IN ('Tenant', 'Owner', 'SystemAdmin')");
                });

            migrationBuilder.CreateTable(
                name: "OwnerVerifications",
                columns: table => new
                {
                    VerificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonalInformation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdDocumentRef = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: false),
                    SupportingDocsRef = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNote = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OwnerVerifications", x => x.VerificationId);
                    table.CheckConstraint("CK_OwnerVerification_Status", "Status IN ('PendingReview', 'Verified', 'Rejected')");
                    table.ForeignKey(
                        name: "FK_OwnerVerifications_UserAccounts_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Properties",
                columns: table => new
                {
                    PropertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    MapLocation = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GeneralPolicies = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Properties", x => x.PropertyId);
                    table.ForeignKey(
                        name: "FK_Properties_UserAccounts_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "RoomListings",
                columns: table => new
                {
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PropertyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Amenities = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailableFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    FurnishedStatus = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PrivateWCStatus = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ImagesRef = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomListings", x => x.ListingId);
                    table.CheckConstraint("CK_RoomListing_FurnishedStatus", "FurnishedStatus IN ('FullyFurnished', 'PartiallyFurnished', 'Unfurnished')");
                    table.CheckConstraint("CK_RoomListing_PrivateWCStatus", "PrivateWCStatus IN ('Private', 'Shared', 'None')");
                    table.CheckConstraint("CK_RoomListing_Status", "Status IN ('Draft', 'PublishedAvailable', 'Locked', 'Hidden', 'Archived')");
                    table.ForeignKey(
                        name: "FK_RoomListings_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "PropertyId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RentalRequests",
                columns: table => new
                {
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MoveInDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ExpectedRentalDuration = table.Column<int>(type: "int", nullable: false),
                    OccupantCount = table.Column<int>(type: "int", nullable: false),
                    OccupationCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BudgetExpectation = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PreferredContactMethod = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    SpecialNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DecidedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalRequests", x => x.RequestId);
                    table.CheckConstraint("CK_RentalRequest_Status", "Status IN ('Pending', 'Accepted', 'Rejected', 'CancelledByTenant', 'RevokedByOwner')");
                    table.ForeignKey(
                        name: "FK_RentalRequests_RoomListings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "RoomListings",
                        principalColumn: "ListingId");
                    table.ForeignKey(
                        name: "FK_RentalRequests_UserAccounts_TenantId",
                        column: x => x.TenantId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.ConversationId);
                    table.ForeignKey(
                        name: "FK_Conversations_RentalRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "RentalRequests",
                        principalColumn: "RequestId");
                    table.ForeignKey(
                        name: "FK_Conversations_UserAccounts_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Conversations_UserAccounts_TenantId",
                        column: x => x.TenantId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    MessageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.MessageId);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "ConversationId");
                    table.ForeignKey(
                        name: "FK_ChatMessages_RentalRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "RentalRequests",
                        principalColumn: "RequestId");
                    table.ForeignKey(
                        name: "FK_ChatMessages_UserAccounts_SenderId",
                        column: x => x.SenderId,
                        principalTable: "UserAccounts",
                        principalColumn: "UserId");
                });

            migrationBuilder.InsertData(
                table: "UserAccounts",
                columns: new[] { "UserId", "AccountStatus", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone", "Role" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@hmss.local", "System Administrator", "$2a$11$.xiHVGhdLQuhJju6xaikaup9tH3uMKd9bh6KtvXn80Se6P3adwNJC", "0000000000", "SystemAdmin" },
                    { new Guid("00000000-0000-0000-0000-000000000002"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "owner@hmss.local", "Demo Owner", "$2a$11$/4dlW08KauFF1OFfP7r79OpYl28zJKu8.4oCpV2WTWsCHP2Xso0XS", "0901234567", "Owner" },
                    { new Guid("00000000-0000-0000-0000-000000000003"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "tenant@hmss.local", "Demo Tenant", "$2a$11$A39f14qYzTS2zbyjpjq/zO0MFhDGBTTnerrwTUEO/qhTqeKuEINne", "0912345678", "Tenant" },
                    { new Guid("00000000-0000-0000-0000-000000000004"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "owner2@hmss.local", "Nguyen Van Minh", "$2a$11$PcJPJUrOLexSnouaA5M48u9ESS2e.llBwlfwh8pOgRFB4EN8.bqkC", "0902345678", "Owner" },
                    { new Guid("00000000-0000-0000-0000-000000000005"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "owner3@hmss.local", "Tran Thi Lan", "$2a$11$LhPSDwlEcrr9wWxVnHhW6OUNbuns40Ic3HDJ1DggUrPhg0V/x6bGa", "0903456789", "Owner" },
                    { new Guid("00000000-0000-0000-0000-000000000006"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "owner4@hmss.local", "Le Hoang Nam", "$2a$11$bvOgpfP3d60bMofO5x1bgeJexkHpDYo52.aeiaN8rqxRjAPjBMXZm", "0904567890", "Owner" },
                    { new Guid("00000000-0000-0000-0000-000000000007"), "Active", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "owner5@hmss.local", "Pham Thi Thu", "$2a$11$pbMw3Xp3WeS2iP9ElFOsyuCLi3RM3I7Gsms03J.PdudrfEzfXKmga", "0905678901", "Owner" }
                });

            migrationBuilder.InsertData(
                table: "OwnerVerifications",
                columns: new[] { "VerificationId", "IdDocumentRef", "OwnerId", "PersonalInformation", "ReviewNote", "ReviewedAt", "Status", "SubmittedAt", "SupportingDocsRef" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000030"), "seed/id-document-owner1.pdf", new Guid("00000000-0000-0000-0000-000000000002"), "Demo Owner – ID verified for seeding purposes.", "Auto-approved via seed data.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Verified", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00000000-0000-0000-0000-000000000031"), "seed/id-document-owner2.pdf", new Guid("00000000-0000-0000-0000-000000000004"), "Nguyen Van Minh – ID verified for seeding purposes.", "Auto-approved via seed data.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Verified", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00000000-0000-0000-0000-000000000032"), "seed/id-document-owner3.pdf", new Guid("00000000-0000-0000-0000-000000000005"), "Tran Thi Lan – ID verified for seeding purposes.", "Auto-approved via seed data.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Verified", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00000000-0000-0000-0000-000000000033"), "seed/id-document-owner4.pdf", new Guid("00000000-0000-0000-0000-000000000006"), "Le Hoang Nam – ID verified for seeding purposes.", "Auto-approved via seed data.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Verified", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null },
                    { new Guid("00000000-0000-0000-0000-000000000034"), "seed/id-document-owner5.pdf", new Guid("00000000-0000-0000-0000-000000000007"), "Pham Thi Thu – ID verified for seeding purposes.", "Auto-approved via seed data.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Verified", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), null }
                });

            migrationBuilder.InsertData(
                table: "Properties",
                columns: new[] { "PropertyId", "Address", "CreatedAt", "Description", "GeneralPolicies", "MapLocation", "Name", "OwnerId", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000010"), "123 Nguyen Hue Street, District 1, Ho Chi Minh City", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A comfortable hostel located in the heart of the city with easy access to transportation.", "No smoking indoors. Quiet hours from 10 PM to 7 AM. Guests must register at front desk.", null, "Sunrise Hostel", new Guid("00000000-0000-0000-0000-000000000002"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000011"), "45 Tran Hung Dao Street, Hoan Kiem District, Hanoi", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Modern residences near Hoan Kiem Lake with excellent public transport links.", "No parties or loud music. Pets not allowed. Monthly electricity billed separately.", null, "Central Park Residences", new Guid("00000000-0000-0000-0000-000000000004"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000012"), "78 Bui Vien Street, District 1, Ho Chi Minh City", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Vibrant hostel on the famous backpacker street. Walking distance to Ben Thanh Market.", "Curfew at midnight. No cooking in rooms. ID required at check-in.", null, "Saigon Garden Hostel", new Guid("00000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000013"), "12 Vo Nguyen Giap Street, Son Tra District, Da Nang", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Peaceful guesthouse 5 minutes walk from My Khe Beach with sea breeze views.", "No sandy shoes inside. Towels provided. Checkout by 11 AM.", null, "Beachside Retreat", new Guid("00000000-0000-0000-0000-000000000005"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000014"), "34 Phan Dinh Phung Street, Da Lat City, Lam Dong", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Cozy highland lodge surrounded by pine forests. Cool climate year-round.", "Blankets and heater provided. No campfires on premises. Respect quiet hours 9 PM onward.", null, "Mountain View Lodge", new Guid("00000000-0000-0000-0000-000000000006"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000015"), "56 Nguyen Tat Thanh Street, District 4, Ho Chi Minh City", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Budget-friendly house near HCMC University of Technology. Ideal for students.", "Students preferred. Study quiet hours from 8 PM to 6 AM. Shared kitchen available.", null, "University Quarter House", new Guid("00000000-0000-0000-0000-000000000007"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "RoomListings",
                columns: new[] { "ListingId", "Amenities", "AvailableFrom", "Capacity", "CreatedAt", "Description", "FurnishedStatus", "ImagesRef", "Price", "PrivateWCStatus", "PropertyId", "PublishedAt", "Status", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000020"), "[\"WiFi\",\"Air Conditioning\",\"Water Heater\",\"Desk\"]", new DateOnly(2026, 2, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A bright single room on the 3rd floor with a window overlooking the city.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\"]", 3500000m, "Private", new Guid("00000000-0000-0000-0000-000000000010"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Cozy Single Room – City View", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000021"), "[\"WiFi\",\"Fan\",\"Shared Kitchen\"]", new DateOnly(2026, 2, 1), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A spacious double room shared with one other tenant. Great for budget travelers.", "PartiallyFurnished", "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]", 2200000m, "Shared", new Guid("00000000-0000-0000-0000-000000000010"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Shared Double Room – Budget Stay", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000022"), "[\"WiFi\",\"Air Conditioning\",\"Private Bathroom\",\"Mini Fridge\",\"Smart TV\"]", new DateOnly(2026, 2, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bright studio apartment with large windows and lake view on the 5th floor.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800\",\"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800\",\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800\"]", 5500000m, "Private", new Guid("00000000-0000-0000-0000-000000000011"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Modern Studio – Hoan Kiem View", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000023"), "[\"WiFi\",\"Air Conditioning\",\"Wardrobe\",\"Hot Water\"]", new DateOnly(2026, 3, 1), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Twin beds, ideal for two colleagues or travel partners. Very central location.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1585128792020-803d29415281?w=800\",\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\"]", 4200000m, "Shared", new Guid("00000000-0000-0000-0000-000000000011"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Twin Bedroom – City Centre", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000024"), "[\"WiFi\",\"Air Conditioning\",\"En-suite Bathroom\",\"Locker\"]", new DateOnly(2026, 2, 15), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "En-suite private room in the heart of the backpacker district. Vibrant nightlife outside.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800\",\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800\"]", 3800000m, "Private", new Guid("00000000-0000-0000-0000-000000000012"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Private Room – Backpacker Hub", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000025"), "[\"WiFi\",\"Fan\",\"Locker\",\"Reading Light\",\"Shared Bathroom\"]", new DateOnly(2026, 2, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Comfortable bunk bed in a clean mixed dorm. Lockers and individual reading lights included.", "PartiallyFurnished", "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]", 1200000m, "Shared", new Guid("00000000-0000-0000-0000-000000000012"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Dorm Bed – Mixed 6-Bed Room", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000026"), "[\"WiFi\",\"Air Conditioning\",\"Beach Towels\",\"Balcony\",\"Hot Water\"]", new DateOnly(2026, 3, 1), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Airy double room with ocean breeze. Just a short stroll to My Khe Beach.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\",\"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800\"]", 4500000m, "Private", new Guid("00000000-0000-0000-0000-000000000013"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Sea Breeze Double Room", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000027"), "[\"WiFi\",\"Fan\",\"Shared Bathroom\"]", new DateOnly(2026, 2, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Simple, clean single room for solo travellers on a budget near the beach.", "PartiallyFurnished", "[\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\",\"https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800\"]", 2500000m, "Shared", new Guid("00000000-0000-0000-0000-000000000013"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Budget Single – Ground Floor", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000028"), "[\"WiFi\",\"Heater\",\"Fireplace\",\"Private Bathroom\",\"Coffee Maker\",\"Garden View\"]", new DateOnly(2026, 2, 1), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Romantic suite with large windows overlooking pine forests. Fireplace included.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800\",\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800\",\"https://images.unsplash.com/photo-1585128792020-803d29415281?w=800\"]", 6000000m, "Private", new Guid("00000000-0000-0000-0000-000000000014"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Pine Forest Suite", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000029"), "[\"WiFi\",\"Heater\",\"Hot Water\",\"Desk\"]", new DateOnly(2026, 3, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Warm single room with thick blankets and mountain air. Perfect for a quiet retreat.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800\"]", 3200000m, "Shared", new Guid("00000000-0000-0000-0000-000000000014"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Cosy Highland Single", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-00000000002a"), "[\"WiFi\",\"Air Conditioning\",\"Desk\",\"Bookshelf\",\"Hot Water\"]", new DateOnly(2026, 2, 1), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Quiet study room ideal for university students. Desk, bookshelf, and fast WiFi provided.", "FullyFurnished", "[\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\",\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]", 2800000m, "Shared", new Guid("00000000-0000-0000-0000-000000000015"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Student Room – Near HCMC University", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-00000000002b"), "[\"WiFi\",\"Fan\",\"2 Desks\",\"Shared Kitchen\",\"Laundry Access\"]", new DateOnly(2026, 2, 1), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Affordable shared room for two students. Separate study desks and personal storage.", "PartiallyFurnished", "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\"]", 1800000m, "Shared", new Guid("00000000-0000-0000-0000-000000000015"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "PublishedAvailable", "Shared Room – 2 Students", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId_SentAt",
                table: "ChatMessages",
                columns: new[] { "ConversationId", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_RequestId_SentAt",
                table: "ChatMessages",
                columns: new[] { "RequestId", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderId",
                table: "ChatMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OwnerId_TenantId",
                table: "Conversations",
                columns: new[] { "OwnerId", "TenantId" },
                unique: true,
                filter: "[RequestId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_OwnerId_TenantId_RequestId",
                table: "Conversations",
                columns: new[] { "OwnerId", "TenantId", "RequestId" },
                unique: true,
                filter: "[RequestId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_RequestId",
                table: "Conversations",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_TenantId",
                table: "Conversations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_OwnerVerifications_OwnerId",
                table: "OwnerVerifications",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_Properties_OwnerId",
                table: "Properties",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalRequests_ListingId",
                table: "RentalRequests",
                column: "ListingId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalRequests_TenantId",
                table: "RentalRequests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RoomListings_PropertyId",
                table: "RoomListings",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_Email",
                table: "UserAccounts",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "OwnerVerifications");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "RentalRequests");

            migrationBuilder.DropTable(
                name: "RoomListings");

            migrationBuilder.DropTable(
                name: "Properties");

            migrationBuilder.DropTable(
                name: "UserAccounts");
        }
    }
}
