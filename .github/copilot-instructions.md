# AI Coding Agent Instructions - Hotel Management System

## Architecture Overview

This is a full-stack hotel management system (HMS) built with:

- **Backend**: Node.js + TypeScript + Hono framework + Drizzle ORM
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Redis for caching
- **State Management**: Zustand (auth/cart) + React Query (API calls)
- **Authentication**: JWT with role-based access control (RBAC)
- **DevOps**: Docker + docker-compose + multi-stage builds

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API route handlers with RBAC middleware
│   ├── services/       # Business logic with transaction handling
│   ├── middleware/     # Auth, RBAC, audit logging
│   ├── db/            # Schema, migrations, database connections
│   └── scripts/       # Database seeding and utilities
frontend/
├── src/
│   ├── components/    # shadcn/ui components + custom layouts
│   ├── pages/         # Route-based page components
│   ├── hooks/         # React Query hooks (useAuth, useBookings, etc.)
│   ├── lib/           # API client, utilities, configurations
│   ├── store/         # Zustand stores (authStore, cartStore)
│   └── assets/        # Static assets
```

## Development Workflow

- **Start development**: `pnpm run dev` (starts DB + backend + frontend concurrently)
- **Database setup**: `pnpm run db:push` after schema changes
- **API testing**: Use `curl` or Postman with JWT Bearer tokens
- **Build**: `pnpm run build` (builds both frontend/backend)
- **Docker**: `pnpm run docker:up` for full containerized environment

## Key Patterns & Conventions

### API Design

- **Authentication**: JWT tokens stored in Zustand, auto-injected via API client
- **Roles**: `admin` > `manager` > `receptionist` > `guest` hierarchy
- **Route Protection**: Apply `roleMiddleware(['admin'])` before route handlers
- **Examples**:

  ```typescript
  // Protected admin route
  app.get('/users', roleMiddleware(['admin']), async (c) => { ... })

  // Staff-only operations
  app.put('/bookings/:id', roleMiddleware(['admin', 'manager', 'receptionist']), ...)
  ```

### Database Patterns

- **Schema**: Defined in `backend/src/db/schema.ts` with Drizzle ORM
- **Migrations**: `pnpm run db:generate` then `pnpm run db:push`
- **Relations**: Use Drizzle relations for type-safe joins
- **Indexing**: Critical indexes on date/foreign key columns for reporting
- **Enums**: Strict status flows (bookings: `pending_payment` → `confirmed` → `checked_in` → `checked_out`)

### Business Logic

- **Transactions**: Use `db.transaction()` for booking operations to prevent race conditions
- **Audit Logging**: `auditMiddleware()` intercepts CREATE/UPDATE/DELETE operations
- **Status Enforcement**: Services validate status transitions (e.g., can't check-in cancelled booking)
- **Availability**: `AvailabilityService.checkRoomAvailability()` prevents overbooking

### Frontend Patterns

- **Components**: Use shadcn/ui (Table, Form, Card, Dialog) from `frontend/src/components/ui/`
- **Data Fetching**: React Query hooks with error handling and loading states
- **State**: `authStore` for authentication, `cartStore` for food ordering
- **Routing**: Protected routes redirect to `/login` if unauthenticated
- **API Calls**: Centralized in `frontend/src/lib/api.ts` with automatic auth headers

### Error Handling

- **API Responses**: `{ success: boolean, data?: T, message?: string }` format
- **Frontend**: React Query handles errors, displays user-friendly messages
- **Validation**: Use Zod schemas for request validation in routes

## Critical Files to Reference

- `backend/src/db/schema.ts` - Complete database schema with relations
- `backend/src/middleware/rbac.ts` - Role-based access control utilities
- `backend/src/middleware/audit.ts` - Audit logging implementation
- `backend/src/services/bookingService.ts` - Transaction-based booking logic
- `frontend/src/store/authStore.ts` - Authentication state management
- `frontend/src/lib/api.ts` - API client with JWT injection
- `docker-compose.yml` - Service orchestration and networking

## Common Patterns & Gotchas

- **Role Checks**: Use `isStaff(user)` for admin/manager/receptionist access
- **Audit Triggers**: Applied to critical mutations, logs user/action/table/recordId
- **Booking Transactions**: Always wrap multi-table booking operations in transactions
- **Status Flows**: Enforce in services (e.g., `booking.status !== 'cancelled'`)
- **Environment Config**: Store secrets in `.env`, never in database
- **Indexing**: Date and foreign key columns indexed for dashboard performance
- **Docker Volumes**: Persistent data for postgres/redis/grafana

## Development Phases

Current implementation covers Phase 1 (auth) with foundation for Phase 2-5. Follow roadmap in `README.md` for feature progression.
