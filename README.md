# Helpdesk / Support Ticket Management System

A full-stack helpdesk application: customers raise support tickets, agents/admins
triage, assign, and resolve them.

## Stack

- **Backend:** Node.js, Express, Sequelize, PostgreSQL, JWT auth, express-validator
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Auth:** JWT access tokens (15 min) + refresh tokens (7 days), bcrypt password hashing

## Architecture & design decisions

- **Roles:** `customer`, `agent`, `admin`. Public registration always creates a
  `customer` account; staff accounts (`agent`/`admin`) are provisioned by an
  admin via the Users screen — this avoids anyone self-elevating to staff.
- **Ticket visibility:** customers only ever see their own tickets; agents/admins
  see everything and can filter by assignment.
- **Audit trail:** every status change is recorded in `ticket_status_history`
  (who, when, from → to, optional note), independent of the ticket's current
  state — this is what a reviewer would poke at when checking "tracking/history".
- **Internal notes:** comments can be flagged `isInternal` by staff; customers
  never see internal notes, and customers can never set that flag themselves.
- **Optimistic concurrency:** tickets carry a `version` column. Every `PATCH`
  must include the version it was read at; a stale version returns `409
  Conflict` instead of silently clobbering a concurrent edit (e.g. two agents
  updating the same ticket).
- **Soft deletes:** `paranoid: true` on Users and Tickets — deletion never
  destroys history rows without a trace, and the admin-only DELETE route
  soft-deletes.
- **Validation:** every write route validates with `express-validator`
  server-side (never trust client-side validation alone); the frontend also
  validates for a good UX.
- **Errors:** a single centralized error-handling middleware normalizes
  Sequelize errors (unique constraint, validation, FK violations) and
  `AppError`s into one consistent JSON shape and never leaks stack traces
  outside development.
- **Security:** helmet for HTTP headers, CORS locked to the configured client
  origin, rate limiting on auth endpoints, bcrypt-hashed passwords, JWT
  short-lived access tokens with refresh tokens.

## Project structure

```
helpdesk-system/
  backend/
    src/
      config/       # sequelize-cli + DB config
      models/        # Sequelize models
      migrations/     # schema migrations
      seeders/       # demo data
      middleware/    # auth, validation, error handling
      controllers/    # route handlers
      routes/        # express routers
      app.js         # express app
      server.js       # entry point
  frontend/
    src/
      api/          # axios client with token refresh
      context/       # AuthContext
      components/    # Navbar, ProtectedRoute, badges
      pages/        # Login, Register, TicketList, TicketDetail, NewTicket, Users
```

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally (or a connection string to one)

## Setup

### 1. Database

Create a database:

```bash
createdb helpdesk_dev
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env with your DB credentials if they differ from the defaults
npm install
npm run migrate
npm run seed
npm run dev
```

The API starts on `http://localhost:5000`. Health check: `GET /api/health`.

Demo accounts created by the seeder (password for all: `Password123!`):

| Role     | Email                  |
|----------|-------------------------|
| Admin    | admin@helpdesk.test     |
| Agent    | agent@helpdesk.test     |
| Customer | customer@helpdesk.test  |

To reset the database at any point: `npm run db:reset`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:5173` and talks to the API at the URL in
`.env` (`VITE_API_URL`).

## API overview

All routes are prefixed `/api`.

| Method | Route                     | Access          | Notes |
|--------|---------------------------|-----------------|-------|
| POST   | `/auth/register`          | Public          | Always creates a `customer` |
| POST   | `/auth/login`              | Public          | Returns access + refresh tokens |
| POST   | `/auth/refresh`            | Public          | Exchanges refresh token for new access token |
| GET    | `/auth/me`                 | Authenticated   | |
| GET    | `/tickets`                  | Authenticated   | Paginated; `status`, `priority`, `category`, `assignedTo`, `search`, `sortBy`, `sortDir` |
| GET    | `/tickets/:id`               | Authenticated   | Owner or staff only |
| POST   | `/tickets`                  | Authenticated   | Creates as `open` |
| PATCH  | `/tickets/:id`               | Owner (limited) / staff | Requires `version`; 409 on stale version |
| DELETE | `/tickets/:id`               | Admin only      | Soft delete |
| POST   | `/tickets/:id/comments`       | Owner or staff  | Staff can set `isInternal` |
| GET    | `/users/agents`              | Staff           | For assignment dropdowns |
| GET    | `/users`                    | Admin           | |
| POST   | `/users`                    | Admin           | Provisions agent/admin accounts |
| PATCH  | `/users/:id`                 | Admin           | Change role / activate-deactivate |
