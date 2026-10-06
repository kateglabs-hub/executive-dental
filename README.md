# Executive Dental

A production-style dental clinic booking and payment-status tracker built with Next.js, TypeScript, Tailwind CSS, and a PostgreSQL/Prisma-ready domain model.

## What is implemented

- Responsive clinic workspace UI with a calm healthcare visual system.
- Customer booking flow: service → date → available time → request confirmation.
- Customer appointment list with status and payment badges.
- Staff-facing operations: search appointments, approve pending requests, and record offline payment status.
- Admin-facing reporting view with collected revenue, paid appointment count, average booking value, and a revenue chart.
- Service catalog with pricing, duration, descriptions, and one-click booking.
- Typed domain helpers for overlap detection, availability filtering, status metadata, and revenue calculation.
- Prisma schema covering users, roles, services, staff specialties, opening hours, blocked time, bookings, payments, and audit logs.
- Unit tests for availability, overlap, cancellation behavior via active-state filtering, and revenue.

The current sandbox build intentionally uses seeded in-memory data so it can be explored immediately without requiring a running PostgreSQL instance. The schema and README document the production persistence path.

## Recommended stack

- **Frontend/API:** Next.js App Router, TypeScript, route handlers/server actions.
- **Styling:** Tailwind CSS with reusable CSS primitives in `src/app/globals.css`.
- **Database:** PostgreSQL.
- **ORM:** Prisma (`prisma/schema.prisma`).
- **Authentication:** Secure email/password session auth with Argon2 or bcrypt password hashing and server-side role guards.
- **Validation:** Zod schemas at route boundaries.
- **Testing:** Vitest for business logic and Playwright for critical browser flows.
- **Deployment:** Vercel for the Next.js app and Railway/Render/Fly.io for managed PostgreSQL if the database is hosted separately.

## Folder structure

```text
src/
  app/
    globals.css       # Visual system and responsive layout
    layout.tsx        # Metadata and root shell
    page.tsx          # Demo workspace screens and interactions
  lib/
    domain.ts         # Domain types, seed data, availability and revenue rules
    domain.test.ts    # Focused business-rule tests
prisma/
  schema.prisma       # PostgreSQL schema and indexes
.env.example          # Environment variable contract
```

## Domain and database design

A booking belongs to one customer, one service, and optionally one staff profile. The service duration is persisted and used to calculate the appointment end time. Payments are separate records so payment status, amount due, amount paid, method, reference, and audit metadata can evolve independently from the booking lifecycle.

Important indexes cover booking time ranges, staff + start time, customer, booking status, payment status, and unique emails/references. Opening hours and blocked time are first-class records so clinic hours, lunch, holidays, and staff leave can be configured rather than hard-coded.

## Availability and double-booking strategy

The application-level algorithm uses the overlap rule:

```text
existing.startTime < requestedEndTime
AND existing.endTime > requestedStartTime
```

Only `PENDING` and `CONFIRMED` bookings are active blockers; cancelled bookings do not consume availability. The production route should create the booking inside a PostgreSQL transaction, lock the relevant staff/day inventory row, re-check active overlaps, then insert. For a stronger database guarantee, add a PostgreSQL `EXCLUDE USING gist` constraint over a `tstzrange(startTime, endTime)` for assigned staff, or implement a slot-inventory table with a unique `(staffId, startTime)` constraint. A conflict returns HTTP `409` with a user-facing message such as “This time slot was just booked. Please choose another available time.”

## Authorization approach

Role checks must run on the server, not only in hidden UI buttons:

- **CUSTOMER:** own bookings only; can cancel their own eligible future booking; cannot alter payment status.
- **STAFF:** clinic booking and payment operations; no admin configuration.
- **ADMIN:** all booking, service, staff, opening-hour, blocked-time, and reporting operations.

Expected errors are `401` unauthenticated, `403` unauthorized, `404` where resource hiding is appropriate, `409` scheduling conflict, and `422` validation failure.

## Payment workflow

This app tracks payment status only; it does not charge cards or process real payments. New bookings start `UNPAID`. Staff/admin can record an offline method such as Cash, Card, Mobile Money, Bank Transfer, or Other. Collected revenue counts `PAID` records and excludes `UNPAID`, `PENDING_VERIFICATION`, and `REFUNDED` records. Actions should be labeled “Record payment status” or “Mark as paid,” never “Charge customer.”

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@executivedental.demo` | `Admin123!` |
| Staff | `staff@executivedental.demo` | `Staff123!` |
| Customer | `customer@executivedental.demo` | `Customer123!` |

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

### Database commands for the production persistence phase

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### Tests and validation

```bash
npm test
npm run lint
npm run build
```

## API route plan

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/services`, `POST/PATCH /api/admin/services`
- `GET /api/availability?serviceId=&date=&staffId=`
- `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/:id`, `POST /api/bookings/:id/cancel`, `POST /api/bookings/:id/reschedule`
- `POST /api/staff/bookings/:id/approve`, `POST /api/staff/bookings/:id/complete`, `POST /api/staff/bookings/:id/no-show`
- `GET /api/bookings/:id/payment`, `POST /api/staff/bookings/:id/payment`
- `GET /api/admin/dashboard`, `GET /api/admin/revenue`, `PATCH /api/admin/opening-hours`, `POST /api/admin/blocked-times`

## Deployment

- Live frontend URL: `FRONTEND_DEPLOYMENT_URL`
- Live API URL: `API_DEPLOYMENT_URL`
- Store `DATABASE_URL`, `AUTH_SECRET`, `CLINIC_TIMEZONE`, and `CLINIC_CURRENCY` as deployment secrets.
- Run Prisma migrations during deployment before serving traffic.
- Use secure HTTP-only cookies with `SameSite=Lax`, CSRF protection for mutations, and rate limits on authentication endpoints.

## Known limitations / next steps

1. Replace the demo in-memory state with Prisma queries and transaction-backed route handlers.
2. Add password hashing/session auth, Zod request schemas, and server-side role guards.
3. Add Prisma seed script with the demo accounts, four services, two staff members, opening hours, blocked lunch periods, upcoming bookings, and payment records.
4. Add Playwright coverage for login, booking, approval, cancellation, and role boundaries.
5. Add a calendar view, configurable service capacity, and staff specialty filters.
6. Add screenshots to this README after deployment.
