using Hmss.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hmss.Api.Data;

public class HmssDbContext : DbContext
{
    public HmssDbContext(DbContextOptions<HmssDbContext> options) : base(options) { }

    public DbSet<UserAccount> UserAccounts { get; set; }
    public DbSet<Property> Properties { get; set; }
    public DbSet<RoomListing> RoomListings { get; set; }
    public DbSet<RentalRequest> RentalRequests { get; set; }
    public DbSet<OwnerVerification> OwnerVerifications { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }
    public DbSet<Conversation> Conversations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // UserAccount
        builder.Entity<UserAccount>(e => {
            e.HasKey(x => x.UserId);
            e.Property(x => x.Email).HasMaxLength(256).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.FullName).HasMaxLength(256).IsRequired();
            e.Property(x => x.Phone).HasMaxLength(50).IsRequired();
            e.Property(x => x.PasswordHash).HasMaxLength(512).IsRequired();
            e.Property(x => x.Role).HasMaxLength(20).IsRequired();
            e.Property(x => x.AccountStatus).HasMaxLength(20).IsRequired();
            e.HasCheckConstraint("CK_UserAccount_Role", "Role IN ('Tenant', 'Owner', 'SystemAdmin')");
            e.HasCheckConstraint("CK_UserAccount_AccountStatus", "AccountStatus IN ('Active', 'Suspended', 'Disabled')");
        });

        // Property
        builder.Entity<Property>(e => {
            e.HasKey(x => x.PropertyId);
            e.Property(x => x.Name).HasMaxLength(256).IsRequired();
            e.Property(x => x.Address).HasMaxLength(512).IsRequired();
            e.Property(x => x.MapLocation).HasMaxLength(512);
            // FK: Property.OwnerId → UserAccount (NO ACTION)
            e.HasOne<UserAccount>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.NoAction);
        });

        // RoomListing
        builder.Entity<RoomListing>(e => {
            e.HasKey(x => x.ListingId);
            e.Property(x => x.Title).HasMaxLength(256).IsRequired();
            e.Property(x => x.Price).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(x => x.FurnishedStatus).HasMaxLength(30).IsRequired();
            e.Property(x => x.PrivateWCStatus).HasMaxLength(20).IsRequired();
            e.Property(x => x.Status).HasMaxLength(30).IsRequired();
            e.HasCheckConstraint("CK_RoomListing_FurnishedStatus", "FurnishedStatus IN ('FullyFurnished', 'PartiallyFurnished', 'Unfurnished')");
            e.HasCheckConstraint("CK_RoomListing_PrivateWCStatus", "PrivateWCStatus IN ('Private', 'Shared', 'None')");
            e.HasCheckConstraint("CK_RoomListing_Status", "Status IN ('Draft', 'PublishedAvailable', 'Locked', 'Hidden', 'Archived')");
            // FK: RoomListing.PropertyId → Property (CASCADE)
            e.HasOne(x => x.Property).WithMany().HasForeignKey(x => x.PropertyId).OnDelete(DeleteBehavior.Cascade);
        });

        // RentalRequest
        builder.Entity<RentalRequest>(e => {
            e.HasKey(x => x.RequestId);
            e.Property(x => x.ContactPhone).HasMaxLength(50).IsRequired();
            e.Property(x => x.PreferredContactMethod).HasMaxLength(20).IsRequired();
            e.Property(x => x.Status).HasMaxLength(30).IsRequired();
            e.Property(x => x.BudgetExpectation).HasColumnType("decimal(18,2)");
            e.HasCheckConstraint("CK_RentalRequest_Status", "Status IN ('Pending', 'Accepted', 'Rejected', 'CancelledByTenant', 'RevokedByOwner')");
            // FK: RentalRequest.ListingId → RoomListing (NO ACTION)
            e.HasOne(x => x.Listing).WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
            // FK: RentalRequest.TenantId → UserAccount (NO ACTION)
            e.HasOne(x => x.Tenant).WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.NoAction);
        });

        // Conversation
        builder.Entity<Conversation>(e => {
            e.HasKey(c => c.ConversationId);
            // FK: Conversation.OwnerId → UserAccount (NO ACTION)
            e.HasOne(c => c.Owner).WithMany().HasForeignKey(c => c.OwnerId).OnDelete(DeleteBehavior.NoAction);
            // FK: Conversation.TenantId → UserAccount (NO ACTION)
            e.HasOne(c => c.Tenant).WithMany().HasForeignKey(c => c.TenantId).OnDelete(DeleteBehavior.NoAction);
            // FK: Conversation.RequestId → RentalRequest (NO ACTION, optional)
            e.HasOne(c => c.Request).WithMany().HasForeignKey(c => c.RequestId).IsRequired(false).OnDelete(DeleteBehavior.NoAction);
            // Unique: one conversation per (Owner, Tenant, Request) pair.
            // Filtered index handles nullable RequestId: non-null RequestId rows get a
            // standard unique constraint; null RequestId rows use a separate filter.
            e.HasIndex(c => new { c.OwnerId, c.TenantId, c.RequestId })
             .IsUnique()
             .HasFilter("[RequestId] IS NOT NULL");
            e.HasIndex(c => new { c.OwnerId, c.TenantId })
             .IsUnique()
             .HasFilter("[RequestId] IS NULL");
        });

        // ChatMessage
        builder.Entity<ChatMessage>(e => {
            e.HasKey(m => m.MessageId);
            e.Property(m => m.Body).HasMaxLength(2000).IsRequired();
            e.HasOne(m => m.Request).WithMany().HasForeignKey(m => m.RequestId).IsRequired(false).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(m => m.Sender).WithMany().HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.NoAction);
            // FK: ChatMessage.ConversationId → Conversation (NO ACTION, optional)
            e.HasOne(m => m.Conversation).WithMany().HasForeignKey(m => m.ConversationId).IsRequired(false).OnDelete(DeleteBehavior.NoAction);
            e.HasIndex(m => new { m.RequestId, m.SentAt });
            e.HasIndex(m => new { m.ConversationId, m.SentAt });
        });

        // OwnerVerification
        builder.Entity<OwnerVerification>(e => {
            e.HasKey(x => x.VerificationId);
            e.Property(x => x.IdDocumentRef).HasMaxLength(1024).IsRequired();
            e.Property(x => x.Status).HasMaxLength(20).IsRequired();
            e.HasCheckConstraint("CK_OwnerVerification_Status", "Status IN ('PendingReview', 'Verified', 'Rejected')");
            // FK: OwnerVerification.OwnerId → UserAccount (CASCADE)
            e.HasOne<UserAccount>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Cascade);
        });

        // --- Seed Data ---
        var adminId  = new Guid("00000000-0000-0000-0000-000000000001");
        var ownerId  = new Guid("00000000-0000-0000-0000-000000000002");
        var tenantId = new Guid("00000000-0000-0000-0000-000000000003");

        var propertyId   = new Guid("00000000-0000-0000-0000-000000000010");
        var listingId1   = new Guid("00000000-0000-0000-0000-000000000020");
        var listingId2   = new Guid("00000000-0000-0000-0000-000000000021");
        var verificationId = new Guid("00000000-0000-0000-0000-000000000030");

        var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // UserAccounts
        builder.Entity<UserAccount>().HasData(
            new {
                UserId = adminId,
                FullName = "System Administrator",
                Email = "admin@hmss.local",
                Phone = "0000000000",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123!"),
                Role = "SystemAdmin",
                AccountStatus = "Active",
                CreatedAt = seedDate
            },
            new {
                UserId = ownerId,
                FullName = "Demo Owner",
                Email = "owner@hmss.local",
                Phone = "0901234567",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123!"),
                Role = "Owner",
                AccountStatus = "Active",
                CreatedAt = seedDate
            },
            new {
                UserId = tenantId,
                FullName = "Demo Tenant",
                Email = "tenant@hmss.local",
                Phone = "0912345678",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Tenant@123!"),
                Role = "Tenant",
                AccountStatus = "Active",
                CreatedAt = seedDate
            }
        );

        // Property
        builder.Entity<Property>().HasData(new {
            PropertyId = propertyId,
            OwnerId = ownerId,
            Name = "Sunrise Hostel",
            Address = "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
            MapLocation = (string?)null,
            Description = "A comfortable hostel located in the heart of the city with easy access to transportation.",
            GeneralPolicies = "No smoking indoors. Quiet hours from 10 PM to 7 AM. Guests must register at front desk.",
            ImagesRef = "[\"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800\",\"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800\"]",
            CreatedAt = seedDate,
            UpdatedAt = seedDate
        });

        // RoomListings
        builder.Entity<RoomListing>().HasData(
            new {
                ListingId = listingId1,
                PropertyId = propertyId,
                Title = "Cozy Single Room – City View",
                Description = "A bright single room on the 3rd floor with a window overlooking the city.",
                Price = 3_500_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"Water Heater\",\"Desk\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Private",
                ImagesRef = "[\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listingId2,
                PropertyId = propertyId,
                Title = "Shared Double Room – Budget Stay",
                Description = "A spacious double room shared with one other tenant. Great for budget travelers.",
                Price = 2_200_000m,
                Capacity = 2,
                Amenities = "[\"WiFi\",\"Fan\",\"Shared Kitchen\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "PartiallyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            }
        );

        // 4 additional Owner accounts
        var owner2Id = new Guid("00000000-0000-0000-0000-000000000004");
        var owner3Id = new Guid("00000000-0000-0000-0000-000000000005");
        var owner4Id = new Guid("00000000-0000-0000-0000-000000000006");
        var owner5Id = new Guid("00000000-0000-0000-0000-000000000007");

        // 5 additional Properties
        var prop2Id = new Guid("00000000-0000-0000-0000-000000000011");
        var prop3Id = new Guid("00000000-0000-0000-0000-000000000012");
        var prop4Id = new Guid("00000000-0000-0000-0000-000000000013");
        var prop5Id = new Guid("00000000-0000-0000-0000-000000000014");
        var prop6Id = new Guid("00000000-0000-0000-0000-000000000015");

        // 10 additional Room Listings (2 per new property)
        var listing3Id  = new Guid("00000000-0000-0000-0000-000000000022");
        var listing4Id  = new Guid("00000000-0000-0000-0000-000000000023");
        var listing5Id  = new Guid("00000000-0000-0000-0000-000000000024");
        var listing6Id  = new Guid("00000000-0000-0000-0000-000000000025");
        var listing7Id  = new Guid("00000000-0000-0000-0000-000000000026");
        var listing8Id  = new Guid("00000000-0000-0000-0000-000000000027");
        var listing9Id  = new Guid("00000000-0000-0000-0000-000000000028");
        var listing10Id = new Guid("00000000-0000-0000-0000-000000000029");
        var listing11Id = new Guid("00000000-0000-0000-0000-00000000002A");
        var listing12Id = new Guid("00000000-0000-0000-0000-00000000002B");

        // OwnerVerifications (all Verified)
        var verif1Id = new Guid("00000000-0000-0000-0000-000000000030");
        var verif2Id = new Guid("00000000-0000-0000-0000-000000000031");
        var verif3Id = new Guid("00000000-0000-0000-0000-000000000032");
        var verif4Id = new Guid("00000000-0000-0000-0000-000000000033");
        var verif5Id = new Guid("00000000-0000-0000-0000-000000000034");

        // --- Additional UserAccounts (4 Owners) ---
        builder.Entity<UserAccount>().HasData(
            new {
                UserId = owner2Id,
                FullName = "Nguyen Van Minh",
                Email = "owner2@hmss.local",
                Phone = "0902345678",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123!"),
                Role = "Owner",
                AccountStatus = "Active",
                CreatedAt = seedDate
            },
            new {
                UserId = owner3Id,
                FullName = "Tran Thi Lan",
                Email = "owner3@hmss.local",
                Phone = "0903456789",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123!"),
                Role = "Owner",
                AccountStatus = "Active",
                CreatedAt = seedDate
            },
            new {
                UserId = owner4Id,
                FullName = "Le Hoang Nam",
                Email = "owner4@hmss.local",
                Phone = "0904567890",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123!"),
                Role = "Owner",
                AccountStatus = "Active",
                CreatedAt = seedDate
            },
            new {
                UserId = owner5Id,
                FullName = "Pham Thi Thu",
                Email = "owner5@hmss.local",
                Phone = "0905678901",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Owner@123!"),
                Role = "Owner",
                AccountStatus = "Active",
                CreatedAt = seedDate
            }
        );

        // --- 5 additional Properties ---
        builder.Entity<Property>().HasData(
            new {
                PropertyId = prop2Id,
                OwnerId = owner2Id,
                Name = "Central Park Residences",
                Address = "45 Tran Hung Dao Street, Hoan Kiem District, Hanoi",
                MapLocation = (string?)null,
                Description = "Modern residences near Hoan Kiem Lake with excellent public transport links.",
                GeneralPolicies = "No parties or loud music. Pets not allowed. Monthly electricity billed separately.",
                ImagesRef = "[\"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800\",\"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800\",\"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800\"]",
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new {
                PropertyId = prop3Id,
                OwnerId = owner3Id,
                Name = "Saigon Garden Hostel",
                Address = "78 Bui Vien Street, District 1, Ho Chi Minh City",
                MapLocation = (string?)null,
                Description = "Vibrant hostel on the famous backpacker street. Walking distance to Ben Thanh Market.",
                GeneralPolicies = "Curfew at midnight. No cooking in rooms. ID required at check-in.",
                ImagesRef = "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800\"]",
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new {
                PropertyId = prop4Id,
                OwnerId = owner3Id,
                Name = "Beachside Retreat",
                Address = "12 Vo Nguyen Giap Street, Son Tra District, Da Nang",
                MapLocation = (string?)null,
                Description = "Peaceful guesthouse 5 minutes walk from My Khe Beach with sea breeze views.",
                GeneralPolicies = "No sandy shoes inside. Towels provided. Checkout by 11 AM.",
                ImagesRef = "[\"https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800\",\"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800\",\"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800\"]",
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new {
                PropertyId = prop5Id,
                OwnerId = owner4Id,
                Name = "Mountain View Lodge",
                Address = "34 Phan Dinh Phung Street, Da Lat City, Lam Dong",
                MapLocation = (string?)null,
                Description = "Cozy highland lodge surrounded by pine forests. Cool climate year-round.",
                GeneralPolicies = "Blankets and heater provided. No campfires on premises. Respect quiet hours 9 PM onward.",
                ImagesRef = "[\"https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800\",\"https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800\"]",
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            },
            new {
                PropertyId = prop6Id,
                OwnerId = owner5Id,
                Name = "University Quarter House",
                Address = "56 Nguyen Tat Thanh Street, District 4, Ho Chi Minh City",
                MapLocation = (string?)null,
                Description = "Budget-friendly house near HCMC University of Technology. Ideal for students.",
                GeneralPolicies = "Students preferred. Study quiet hours from 8 PM to 6 AM. Shared kitchen available.",
                ImagesRef = "[\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\",\"https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800\"]",
                CreatedAt = seedDate,
                UpdatedAt = seedDate
            }
        );

        // --- 10 additional RoomListings (2 per new property) ---
        builder.Entity<RoomListing>().HasData(
            // prop2 – Central Park Residences (Hanoi)
            new {
                ListingId = listing3Id,
                PropertyId = prop2Id,
                Title = "Modern Studio – Hoan Kiem View",
                Description = "Bright studio apartment with large windows and lake view on the 5th floor.",
                Price = 5_500_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"Private Bathroom\",\"Mini Fridge\",\"Smart TV\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Private",
                ImagesRef = "[\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800\",\"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800\",\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listing4Id,
                PropertyId = prop2Id,
                Title = "Twin Bedroom – City Centre",
                Description = "Twin beds, ideal for two colleagues or travel partners. Very central location.",
                Price = 4_200_000m,
                Capacity = 2,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"Wardrobe\",\"Hot Water\"]",
                AvailableFrom = new DateOnly(2026, 3, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1585128792020-803d29415281?w=800\",\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            // prop3 – Saigon Garden Hostel (Bui Vien)
            new {
                ListingId = listing5Id,
                PropertyId = prop3Id,
                Title = "Private Room – Backpacker Hub",
                Description = "En-suite private room in the heart of the backpacker district. Vibrant nightlife outside.",
                Price = 3_800_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"En-suite Bathroom\",\"Locker\"]",
                AvailableFrom = new DateOnly(2026, 2, 15),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Private",
                ImagesRef = "[\"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800\",\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listing6Id,
                PropertyId = prop3Id,
                Title = "Dorm Bed – Mixed 6-Bed Room",
                Description = "Comfortable bunk bed in a clean mixed dorm. Lockers and individual reading lights included.",
                Price = 1_200_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Fan\",\"Locker\",\"Reading Light\",\"Shared Bathroom\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "PartiallyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            // prop4 – Beachside Retreat (Da Nang)
            new {
                ListingId = listing7Id,
                PropertyId = prop4Id,
                Title = "Sea Breeze Double Room",
                Description = "Airy double room with ocean breeze. Just a short stroll to My Khe Beach.",
                Price = 4_500_000m,
                Capacity = 2,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"Beach Towels\",\"Balcony\",\"Hot Water\"]",
                AvailableFrom = new DateOnly(2026, 3, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Private",
                ImagesRef = "[\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\",\"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listing8Id,
                PropertyId = prop4Id,
                Title = "Budget Single – Ground Floor",
                Description = "Simple, clean single room for solo travellers on a budget near the beach.",
                Price = 2_500_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Fan\",\"Shared Bathroom\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "PartiallyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\",\"https://images.unsplash.com/photo-1590490360182-c33d7aaf884d?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            // prop5 – Mountain View Lodge (Da Lat)
            new {
                ListingId = listing9Id,
                PropertyId = prop5Id,
                Title = "Pine Forest Suite",
                Description = "Romantic suite with large windows overlooking pine forests. Fireplace included.",
                Price = 6_000_000m,
                Capacity = 2,
                Amenities = "[\"WiFi\",\"Heater\",\"Fireplace\",\"Private Bathroom\",\"Coffee Maker\",\"Garden View\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Private",
                ImagesRef = "[\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800\",\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800\",\"https://images.unsplash.com/photo-1585128792020-803d29415281?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listing10Id,
                PropertyId = prop5Id,
                Title = "Cosy Highland Single",
                Description = "Warm single room with thick blankets and mountain air. Perfect for a quiet retreat.",
                Price = 3_200_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Heater\",\"Hot Water\",\"Desk\"]",
                AvailableFrom = new DateOnly(2026, 3, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800\",\"https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            // prop6 – University Quarter House (HCMC)
            new {
                ListingId = listing11Id,
                PropertyId = prop6Id,
                Title = "Student Room – Near HCMC University",
                Description = "Quiet study room ideal for university students. Desk, bookshelf, and fast WiFi provided.",
                Price = 2_800_000m,
                Capacity = 1,
                Amenities = "[\"WiFi\",\"Air Conditioning\",\"Desk\",\"Bookshelf\",\"Hot Water\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "FullyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800\",\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800\",\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            },
            new {
                ListingId = listing12Id,
                PropertyId = prop6Id,
                Title = "Shared Room – 2 Students",
                Description = "Affordable shared room for two students. Separate study desks and personal storage.",
                Price = 1_800_000m,
                Capacity = 2,
                Amenities = "[\"WiFi\",\"Fan\",\"2 Desks\",\"Shared Kitchen\",\"Laundry Access\"]",
                AvailableFrom = new DateOnly(2026, 2, 1),
                FurnishedStatus = "PartiallyFurnished",
                PrivateWCStatus = "Shared",
                ImagesRef = "[\"https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800\",\"https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800\"]",
                Status = "PublishedAvailable",
                CreatedAt = seedDate,
                UpdatedAt = seedDate,
                PublishedAt = (DateTime?)seedDate
            }
        );

        // --- OwnerVerifications (all 5 owners, all Verified) ---
        builder.Entity<OwnerVerification>().HasData(
            new {
                VerificationId = verif1Id,
                OwnerId = ownerId,
                PersonalInformation = (string?)"Demo Owner – ID verified for seeding purposes.",
                IdDocumentRef = "seed/id-document-owner1.pdf",
                SupportingDocsRef = (string?)null,
                Status = "Verified",
                SubmittedAt = seedDate,
                ReviewedAt = (DateTime?)seedDate,
                ReviewNote = (string?)"Auto-approved via seed data."
            },
            new {
                VerificationId = verif2Id,
                OwnerId = owner2Id,
                PersonalInformation = (string?)"Nguyen Van Minh – ID verified for seeding purposes.",
                IdDocumentRef = "seed/id-document-owner2.pdf",
                SupportingDocsRef = (string?)null,
                Status = "Verified",
                SubmittedAt = seedDate,
                ReviewedAt = (DateTime?)seedDate,
                ReviewNote = (string?)"Auto-approved via seed data."
            },
            new {
                VerificationId = verif3Id,
                OwnerId = owner3Id,
                PersonalInformation = (string?)"Tran Thi Lan – ID verified for seeding purposes.",
                IdDocumentRef = "seed/id-document-owner3.pdf",
                SupportingDocsRef = (string?)null,
                Status = "Verified",
                SubmittedAt = seedDate,
                ReviewedAt = (DateTime?)seedDate,
                ReviewNote = (string?)"Auto-approved via seed data."
            },
            new {
                VerificationId = verif4Id,
                OwnerId = owner4Id,
                PersonalInformation = (string?)"Le Hoang Nam – ID verified for seeding purposes.",
                IdDocumentRef = "seed/id-document-owner4.pdf",
                SupportingDocsRef = (string?)null,
                Status = "Verified",
                SubmittedAt = seedDate,
                ReviewedAt = (DateTime?)seedDate,
                ReviewNote = (string?)"Auto-approved via seed data."
            },
            new {
                VerificationId = verif5Id,
                OwnerId = owner5Id,
                PersonalInformation = (string?)"Pham Thi Thu – ID verified for seeding purposes.",
                IdDocumentRef = "seed/id-document-owner5.pdf",
                SupportingDocsRef = (string?)null,
                Status = "Verified",
                SubmittedAt = seedDate,
                ReviewedAt = (DateTime?)seedDate,
                ReviewNote = (string?)"Auto-approved via seed data."
            }
        );
    }
}
