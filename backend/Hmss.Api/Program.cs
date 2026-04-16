
using Hmss.Api.Auth;
using Hmss.Api.Data;
using Hmss.Api.Gateways.Implementations;
using Hmss.Api.Gateways.Interfaces;
using Hmss.Api.Hubs;
using Hmss.Api.Logic;
using Hmss.Api.Repositories.Implementations;
using Hmss.Api.Repositories.Interfaces;
using Hmss.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HMSS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token"
    });
    // Swashbuckle 10 / OpenApi 2.x: AddSecurityRequirement uses a factory func
    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement {
        {
            new OpenApiSecuritySchemeReference("Bearer", doc),
            new List<string>()
        }
    });
});

// CORS — AllowCredentials() required for SignalR WebSocket with JWT
builder.Services.AddCors(opts => {
    opts.AddPolicy("FrontendPolicy", policy => {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add EF Core (Phase 02)
builder.Services.AddDbContext<HmssDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT config (Phase 03)
builder.Services.Configure<JwtConfig>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<JwtTokenService>();

// JWT Auth
var jwtConfig = builder.Configuration.GetSection("Jwt").Get<JwtConfig>() ?? new JwtConfig();
var jwtSecret = jwtConfig.Secret;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts => {
        opts.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidAudience = jwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
        // SignalR WebSocket sends JWT via query string (?access_token=...)
        opts.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents {
            OnMessageReceived = ctx => {
                var token = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) &&
                    ctx.Request.Path.StartsWithSegments("/hub/chat"))
                {
                    ctx.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(opts => {
    opts.AddPolicy("TenantOnly",      p => p.RequireRole("Tenant"));
    opts.AddPolicy("OwnerOnly",       p => p.RequireRole("Owner"));
    opts.AddPolicy("SystemAdminOnly", p => p.RequireRole("SystemAdmin"));
});

// Phase 04 services
builder.Services.AddScoped<IRoomListingRepository, RoomListingRepository>();
builder.Services.AddScoped<SearchMatchingService>();
builder.Services.AddScoped<IMapGateway, MapboxGateway>();
builder.Services.AddHttpClient();

// In-memory cache for admin 2FA verification codes
builder.Services.AddMemoryCache();

// Phase 05 services
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();
builder.Services.AddScoped<AuthenticationLogic>();

// Phase 06
builder.Services.AddScoped<IRentalRequestRepository, RentalRequestRepository>();
builder.Services.AddScoped<RentalRequestLogic>();
builder.Services.AddScoped<IEmailGateway, EmailGateway>();
// Phase 07
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<PropertyService>();
builder.Services.AddScoped<PropertyLogic>();
// Phase 08
builder.Services.AddScoped<ICloudStorageGateway, CloudStorageGateway>();
builder.Services.AddScoped<RoomListingLogic>();
builder.Services.AddScoped<PublishListingLogic>();
builder.Services.AddScoped<VisibilityLogic>();
builder.Services.AddScoped<ReopenLogic>();
builder.Services.AddScoped<IOwnerVerificationRepository, OwnerVerificationRepository>();
// Phase 09
builder.Services.AddScoped<VerificationLogic>();
builder.Services.AddScoped<ReviewRequestLogic>();
// Phase 10
builder.Services.AddScoped<AccountStatusNotificationService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<ListingControlLogic>();

// Phase 11 — Real-time chat
builder.Services.AddSignalR();
builder.Services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();

// Phase 12 — Payment (PayOS)
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<PaymentService>();

var app = builder.Build();

// Auto-create database, apply migrations, and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HmssDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
// Serve uploads from local storage
// Resolve to absolute path — PhysicalFileProvider requires absolute paths
var uploadsPath = Path.GetFullPath(
    app.Configuration["CloudStorage:BasePath"] ?? "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions {
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/hub/chat");

app.Run();
