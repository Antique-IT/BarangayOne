# BarangayOne – Multi-tenant Barangay e-Governance Platform

BarangayOne is a production-ready, multi-tenant barangay e-governance platform that allows multiple barangays to manage residents, documents, and community services digitally. Built for scalability and ease of use by local government units (LGUs) in the Philippines.

## Features

- **Resident Management** – Register and manage resident records with complete demographic data
- **Household Management** – Track household compositions and family structures
- **Clearance Requests** – Process barangay clearances, certificates, and other documents
- **Blotter Cases** – Record and manage incident reports and dispute resolutions
- **Announcements** – Publish community announcements and notices
- **Analytics** – Visual charts and statistics using Recharts
- **Activity Logs** – Audit trail of all system actions
- **Role-based Access** – Admin, Secretary (Staff), and Resident roles

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js v4 with JWT sessions
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Authentication & RBAC

### Session and Login Flow

- Authentication uses **NextAuth.js v4** with the **Credentials provider** and **JWT sessions**.
- Protected route requests made by unauthenticated users are redirected to `/login` with `callbackUrl`.
- After successful login, users are redirected to:
	- `callbackUrl` (if present and safe), otherwise
	- `/dashboard` for Admin/Secretary
	- `/resident/dashboard` for Resident
- Logout is supported for both dashboard and resident portals.

### Role Mapping

| Product Role | Current System Role | Scope |
|------|------|------|
| Admin | `ADMIN` | Full dashboard + full API access |
| Staff | `SECRETARY` | Dashboard read/write, restricted destructive actions |
| Viewer (Resident portal) | `RESIDENT` | Resident portal only |

### Route and API Protection

- **Page protection (proxy):**
	- `/dashboard/**` and legacy admin paths require Admin/Secretary.
	- `/resident/**` requires Resident.
	- Unauthorized role access is redirected to `/forbidden`.
- **API protection:**
	- All protected APIs require a valid session.
	- Admin APIs enforce role checks (Admin/Secretary for read/write; Admin-only for destructive actions where configured).
	- Resident-only behavior is enforced for resident-owned resources (for example, document download ownership checks).
- **Tenant isolation:**
	- By-ID service lookups are barangay-scoped before update/delete/archive operations.

### Unauthorized Handling

- Unauthenticated requests return **401 Unauthorized** (or redirect to `/login` for pages).
- Authenticated but disallowed requests return **403 Access denied** with a clear message.
- A dedicated denied page is available at `/forbidden`.

### API Permission Matrix

Legend: ✅ allowed, ❌ denied.

| Endpoint Group | Method | Admin (`ADMIN`) | Staff (`SECRETARY`) | Resident (`RESIDENT`) |
|------|------|------|------|------|
| `/api/residents` | `GET`, `POST` | ✅ | ✅ | ❌ |
| `/api/residents/[id]` | `GET`, `PUT` | ✅ | ✅ | ❌ |
| `/api/residents/[id]` | `DELETE` | ✅ | ❌ | ❌ |
| `/api/households` | `GET`, `POST` | ✅ | ✅ | ❌ |
| `/api/households/[id]` | `GET`, `PUT` | ✅ | ✅ | ❌ |
| `/api/households/[id]` | `DELETE` | ✅ | ❌ | ❌ |
| `/api/clearances` | `GET`, `POST` | ✅ | ✅ | ❌ |
| `/api/clearances/[id]` | `GET`, `PUT` | ✅ | ✅ | ❌ |
| `/api/clearances/[id]` | `DELETE` | ✅ | ❌ | ❌ |
| `/api/clearances/[id]/document` | `GET` | ✅ (same barangay) | ✅ (same barangay) | ✅ (owner only, same barangay) |
| `/api/blotter` | `GET`, `POST` | ✅ | ✅ | ❌ |
| `/api/blotter/[id]` | `GET`, `PUT` | ✅ | ✅ | ❌ |
| `/api/blotter/[id]` | `DELETE` | ✅ | ❌ | ❌ |
| `/api/announcements` | `GET`, `POST` | ✅ | ✅ | ❌ |
| `/api/announcements/[id]` | `GET`, `PUT` | ✅ | ✅ | ❌ |
| `/api/announcements/[id]` | `DELETE` | ✅ | ❌ | ❌ |
| `/api/activity-logs` | `GET` | ✅ | ✅ | ❌ |
| `/api/analytics` | `GET` | ✅ | ✅ | ❌ |
| `/api/reports` | `GET` | ✅ | ✅ | ❌ |

All protected APIs require a valid session and barangay association; id-based reads/writes are barangay-scoped before mutation.

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm

### Installation

```bash
git clone https://github.com/your-org/BarangayOne.git
cd BarangayOne
pnpm install
```

`pnpm install` runs `postinstall` and automatically executes `prisma generate`.

### Troubleshooting: used `npm install` by mistake

This workspace is configured for `pnpm` (`pnpm-lock.yaml`). If you accidentally use `npm install` and hit dependency or Prisma client issues, run:

```bash
pnpm install
pnpm prisma generate
```

Then continue with the normal `pnpm` commands below.

### Environment Setup

Create `.env` (used by Prisma CLI). You may also keep the same values in `.env.local` for Next.js runtime:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

If you prefer, copy `.env` to `.env.local` after editing.

### Database Setup

```bash
# For fresh setup (development):
pnpm prisma db push
pnpm run seed

# For existing databases with data migration:
npx ts-node scripts/migrate-to-enums.ts  # Migrate old enum values
pnpm prisma db push                      # Apply new schema
```

The seed script creates demo users and sample data **only in development** (`NODE_ENV=development`) or when `SEED_DEMO_DATA=true` is set. It is idempotent and safe to run multiple times - existing verification codes and data are preserved on re-runs.

**Demo credentials (local dev only):**
- Admin: `admin@barangay.gov.ph` / `admin123`
- Secretary: `secretary@barangay.gov.ph` / `secretary123`  
- Resident: `resident@barangay.gov.ph` / `resident123`

### Development Server

```bash
pnpm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@barangay.gov.ph | admin123 |
| Secretary | secretary@barangay.gov.ph | secretary123 |
| Resident | resident@barangay.gov.ph | resident123 |

## Project Structure

```
app/
├── (dashboard)/          # Protected dashboard routes
│   ├── dashboard/        # Main dashboard
│   ├── residents/        # Resident management
│   ├── households/       # Household management
│   ├── clearances/       # Clearance requests
│   ├── blotter/          # Blotter cases
│   ├── announcements/    # Announcements
│   ├── analytics/        # Charts & analytics
│   ├── reports/          # Report generation
│   ├── activity-logs/    # Audit logs
│   └── settings/         # System settings
├── api/                  # REST API routes
├── login/                # Authentication
└── page.tsx              # Landing page

components/
├── ui/                   # shadcn/ui base components
├── dashboard/            # Dashboard widgets
├── residents/            # Resident components
├── households/           # Household components
├── clearances/           # Clearance components
├── blotter/              # Blotter components
├── announcements/        # Announcement components
└── analytics/            # Chart components

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed data
```

## License

MIT
