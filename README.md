# HMSS — Hotel Management and Search System

Full-stack hostel management app.

## Stack
- **Backend:** ASP.NET Core .NET 8, SQL Server, EF Core, JWT
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS

## Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- SQL Server (Express or full) running locally or remotely

## How to Run

### Step 1 — Configure database connection

Open `backend/Hmss.Api/appsettings.json` and update `DefaultConnection` to match your SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;uid=sa;pwd=YOUR_PASSWORD;Database=HmssDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

> **Note:** You do NOT need to create the database manually. The backend will automatically create it, apply migrations, and seed demo data on first launch.

### Step 2 — Launch the backend

```bash
cd backend/Hmss.Api
dotnet restore
dotnet run
```

On startup the backend will automatically:
- Create the `HmssDb` database if it doesn't exist
- Apply all migrations (tables, constraints, indexes)
- Seed demo data (users, properties, room listings, verifications)

Swagger UI: http://localhost:5236/swagger

### Step 3 — Install Next.js and launch the frontend

```bash
cd frontend
npm install
npm run dev
```

> **Important:** You must run `npm install` first to install Next.js and all frontend dependencies. Without this step the `npm run dev` command will fail.

> **Note:** The first time you run `npm run dev`, Next.js will compile all pages and generate the `.next` build cache. This may take **1–2 minutes** on the initial load. Subsequent starts will be much faster.

App: http://localhost:3000

## Demo Accounts

| Role   | Email              | Password    |
|--------|--------------------|-------------|
| Admin  | admin@hmss.local   | Admin@123!  |
| Owner  | owner@hmss.local   | Owner@123!  |
| Tenant | tenant@hmss.local  | Tenant@123! |

Additional owners: `owner2@hmss.local` through `owner5@hmss.local` (password: `Owner@123!`)

## Configuration Reference

All settings are in `backend/Hmss.Api/appsettings.json`:

| Section            | Purpose                                | Required                |
|--------------------|----------------------------------------|-------------------------|
| `ConnectionStrings`| SQL Server connection                  | Yes                     |
| `Jwt`              | Token signing secret, issuer, audience | Yes (defaults provided) |
| `Mapbox`           | Map embed access token                 | Optional                |
| `GoogleOAuth`      | Google login client ID/secret          | Optional                |
| `Email`            | SMTP settings for notifications        | Optional                |
| `CloudStorage`     | File upload provider and paths         | Yes (defaults to local) |
