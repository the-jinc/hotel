# Hotel Management System

A full-stack hotel management system built with React, TypeScript, Hono, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + TypeScript + Hono framework
- **Database**: PostgreSQL + Drizzle ORM
- **State Management**: Zustand (frontend), React Query for API calls
- **Authentication**: JWT with role-based access control (RBAC)
- **DevOps**: Docker + docker-compose

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Installation

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url>
   cd hotel
   pnpm install
   pnpm run install:all
   ```

2. **Start development environment**:

   ```bash
   # Start database services
   pnpm run dev:db

   # Generate and run database migrations
   pnpm run db:generate
   pnpm run db:push

   # Start both frontend and backend
   pnpm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/health

### Alternative: Docker Development

```bash
# Start everything with Docker
pnpm run docker:up

# View logs
pnpm run docker:logs

# Stop everything
pnpm run docker:down
```

## 📁 Project Structure

```
hotel/
├── backend/                 # Node.js + Hono API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, RBAC, audit logging
│   │   └── db/            # Database schemas and connections
│   ├── Dockerfile
│   └── drizzle.config.ts
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React Query hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── store/         # Zustand stores
│   └── Dockerfile
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development database services
└── phases.md              # Development roadmap
```

## 🔑 Features

### Phase 1: Foundation ✅

- [x] User authentication (register, login, JWT)
- [x] Role-based access control (Admin, Manager, Receptionist, Guest)
- [x] Protected routes and API endpoints
- [x] Modern UI with Tailwind CSS + shadcn/ui
- [x] Docker development environment

### Phase 2: Core Booking (Coming Soon)

- [ ] Room and category management
- [ ] Guest room search and booking
- [ ] Payment processing simulation
- [ ] Staff booking management

### Phase 3: Food Ordering (Coming Soon)

- [ ] Menu management
- [ ] Guest food ordering system
- [ ] Kitchen order management

### Phase 4: Management & Reporting (Coming Soon)

- [ ] Business analytics dashboard
- [ ] Database backup system
- [ ] Audit logging

### Phase 5: Production Ready (Coming Soon)

- [ ] Security hardening
- [ ] Performance optimization
- [ ] CI/CD pipeline
- [ ] Monitoring and alerting

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm run dev              # Start frontend + backend + database
pnpm run dev:frontend     # Start only frontend
pnpm run dev:backend      # Start only backend
pnpm run dev:db          # Start only database services

# Database
pnpm run db:generate     # Generate migrations
pnpm run db:push         # Push schema to database
pnpm run db:migrate      # Run migrations

# Build
pnpm run build           # Build both frontend and backend
pnpm run build:frontend  # Build only frontend
pnpm run build:backend   # Build only backend

# Docker
pnpm run docker:up       # Start all services with Docker
pnpm run docker:down     # Stop all services
pnpm run docker:logs     # View container logs
```

### Database Management

The system uses Drizzle ORM with PostgreSQL. Schema definitions are in `backend/src/db/schema.ts`.

```bash
# Generate new migration after schema changes
pnpm run db:generate

# Apply migrations to database
pnpm run db:push
```

### API Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset

#### User Management (Protected)

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Manager+)
- `POST /users` - Create user (Admin only)
- `PUT /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

## 🔐 User Roles

- **Admin**: Full system access, user management, system settings
- **Manager**: Business operations, reporting, limited user management
- **Receptionist**: Front desk operations, booking management
- **Guest**: Room booking, food ordering, profile management

## 🐳 Docker Configuration

### Development Environment

Uses `docker-compose.dev.yml` to run only database services, allowing local development of frontend/backend.

### Production Environment

Uses `docker-compose.yml` to run the complete application stack.

#### Environment overrides

Copy `.env.production.example` to `.env.production` and fill in the required secrets (JWT key, admin seed credentials, public frontend URL, backup admin token, etc). The file is ignored by git, but `docker compose --env-file .env.production --profile production up -d --build` will pick it up automatically.

#### GitHub Actions deployment

Two GitHub Actions workflows cover production deployments:

- `.github/workflows/deploy-railway.yml` deploys the stack to Railway when you push to `main` or trigger it manually. Configure `RAILWAY_TOKEN` (required) and optionally `RAILWAY_PROJECT`, `RAILWAY_ENVIRONMENT`.
- `.github/workflows/deploy-ec2.yml` syncs the repository to an EC2 host over SSH before running `docker compose --profile production up -d --build`. Configure `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, and optionally `EC2_PORT`.

Set these application secrets when they apply to your deployment target: `BACKUP_ADMIN_TOKEN`, `JWT_SECRET`, `FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `VITE_API_URL`.

The Railway workflow logs in via the CLI and issues `railway up` for backend, frontend, and the optional backup scheduler service. The EC2 workflow writes `.env.production` on the host before running Docker Compose.

The backend container automatically executes database migrations on startup before running the idempotent admin seeder.

The frontend Nginx container proxies `/api/*` requests to the backend service. Leave `VITE_API_URL` at `/api` unless you serve the API from a different public host.

## 📋 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://hotel_user:hotel_password@localhost:5432/hotel_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=/api
```

## 🤝 Contributing

1. Follow the phase-based development plan in `phases.md`
2. Ensure all new features have proper authentication/authorization
3. Use TypeScript for type safety
4. Follow the established patterns for API endpoints and React components
5. Test thoroughly with different user roles

## 📄 License

MIT License - see LICENSE file for details.
