# Database Seeding Guide

This project includes a comprehensive database seeding system to populate your development database with test data.

## Quick Start

```bash
# Seed the database with test data
pnpm run db:seed

# Reset database (push schema + seed)
pnpm run db:reset
```

## Test Accounts

After seeding, you can use these test accounts to login:

| Role         | Email                  | Password    |
| ------------ | ---------------------- | ----------- |
| Admin        | admin@hotel.com        | password123 |
| Manager      | manager@hotel.com      | password123 |
| Receptionist | receptionist@hotel.com | password123 |
| Guest        | guest1@example.com     | password123 |
| Guest        | guest2@example.com     | password123 |
| Guest        | guest3@example.com     | password123 |

## What Gets Created

### Users (6 total)

- 1 Admin user
- 1 Manager user
- 1 Receptionist user
- 3 Guest users

### Room Categories (4 total)

- **Standard Room** - $89.99/night, Max 2 guests
- **Deluxe Room** - $149.99/night, Max 3 guests
- **Executive Suite** - $249.99/night, Max 4 guests
- **Presidential Suite** - $499.99/night, Max 6 guests

### Rooms (44 total)

- **Standard Rooms**: 20 rooms (Floors 1-2, Room Numbers: 101-110, 201-210)
- **Deluxe Rooms**: 16 rooms (Floors 3-4, Room Numbers: 301-308, 401-408)
- **Executive Suites**: 6 rooms (Floor 5, Room Numbers: 501-506)
- **Presidential Suites**: 2 rooms (Floor 6, Room Numbers: 601-602)

### Sample Bookings (3 total)

- Confirmed booking for guest1@example.com
- Pending payment booking for guest2@example.com
- Completed (checked out) booking for guest3@example.com

## Commands

### Root level (from project root):

```bash
pnpm run db:seed     # Run seeding
pnpm run db:reset    # Reset and seed database
```

### Backend level (from backend directory):

```bash
pnpm run db:seed     # Run seeding
pnpm run db:reset    # Push schema and seed
pnpm run db:push     # Push schema only
```

## Development Workflow

1. **Fresh setup**: `pnpm run db:reset`
2. **Add more test data**: Modify `backend/src/scripts/seed.ts`
3. **Re-seed**: `pnpm run db:seed` (clears existing data first)

## Script Location

The seeding script is located at: `backend/src/scripts/seed.ts`

Feel free to modify it to add more test data for your specific development needs!
