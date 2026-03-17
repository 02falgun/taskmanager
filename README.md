# TaskFlow — Production Task Management System

A full-stack, production-grade Task Management System built with modern 2024 standards. Features a Node.js/TypeScript/Express/Prisma backend and a Next.js 14 / TailwindCSS / Framer Motion frontend inspired by Notion, Linear, and ClickUp.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (access + refresh token rotation) |
| Validation | Zod |
| Security | Helmet, CORS, rate-limiting |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS 3 + CSS variables |
| Animations | Framer Motion 11 |
| State | Zustand + TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Drag & Drop | @dnd-kit |
| Notifications | Sonner |

---

## Project Structure

```
TMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # env.ts, database.ts
│   │   ├── controllers/    # auth, task
│   │   ├── middleware/     # auth, validate, error
│   │   ├── repositories/   # user, refreshToken, task
│   │   ├── routes/         # auth, task, index
│   │   ├── services/       # auth, task
│   │   ├── types/          # express.d.ts, auth, task
│   │   ├── utils/          # jwt, hash, response
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── frontend/
    ├── app/
    │   ├── (auth)/         # login, register
    │   ├── (dashboard)/    # dashboard, tasks, analytics
    │   └── layout.tsx
    ├── components/
    │   ├── layout/         # Sidebar, TopNav
    │   ├── providers/      # Theme, Query
    │   └── ui/             # button, input, card, dialog, ...
    ├── features/
    │   └── tasks/          # TaskCard, TaskListView, TaskBoardView, TaskModal
    ├── hooks/              # useAuth, useTasks
    ├── lib/                # api, types, utils
    ├── services/           # auth, task
    ├── store/              # auth.store, ui.store
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted DB)
- npm or pnpm

---

## Quick Setup And Deployment

### Local development

1. Install dependencies:

```bash
npm run setup
```

2. Configure environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env.local`

`frontend/.env.local` example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

3. Start PostgreSQL, then run backend setup:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

4. Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

5. Open `http://localhost:3000/login`

Or run both apps from the repository root:

```bash
npm run dev
```

Demo credentials after seeding:

- `demo@tms.dev`
- `Demo@1234`

### Deployment notes

- Set `NODE_ENV=production` in the backend environment
- Set strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values
- Set `CORS_ORIGIN` to your deployed frontend URL
- Set `NEXT_PUBLIC_API_URL` to your deployed backend API URL
- Cookies are `HttpOnly`; in production they are also `Secure`
- Run migrations on deploy with `npm --prefix backend run prisma:migrate:deploy`
- Build both apps from root with `npm run build`
- Start both apps from root with `npm run start` (or deploy backend/frontend separately)

---

## Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/taskflow_db"
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
PORT=5001
CORS_ORIGIN=http://localhost:3000
```

```bash
# 3. Create the database (psql or your GUI)
createdb taskflow_db

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed demo data (optional)
npm run prisma:seed

# 6. Start development server
npm run dev
```

The backend will be available at `http://localhost:5001`.

### Health check
```
GET http://localhost:5001/api/health
```

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create environment file
touch .env.local
```

`.env.local` contents:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

```bash
# 3. Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Demo Credentials

If you ran the seed script:

| Field | Value |
|-------|-------|
| Email | `demo@tms.dev` |
| Password | `Demo@1234` |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive token pair |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/logout-all` | Revoke all refresh tokens |
| GET  | `/api/auth/me` | Get current user `🔒` |

### Tasks `🔒` (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filters + pagination) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/stats` | Get task statistics |
| GET | `/api/tasks/:id` | Get single task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Cycle task status |

#### Task query params
```
status=TODO|IN_PROGRESS|COMPLETED
priority=LOW|MEDIUM|HIGH
search=<string>
sortBy=createdAt|dueDate|priority|order
sortOrder=asc|desc
page=1
limit=20
```

---

## Features

- **Auth** — JWT dual-token with silent refresh, no re-login on tab reload
- **List View** — Paginated, filterable/searchable task list with animated transitions
- **Board View** — Kanban with drag-and-drop between columns via @dnd-kit
- **Task Modal** — Create/edit form with status, priority, due date, and tags
- **Analytics** — Visual status + priority breakdown with animated bars
- **Dark/Light Mode** — System-aware with manual toggle, persisted to localStorage
- **Optimistic Updates** — Immediate UI feedback before server confirms
- **Glassmorphism UI** — Custom TailwindCSS utilities and CSS variable design tokens

---

## Scripts

### Root (recommended)
```bash
npm run setup      # install backend + frontend dependencies
npm run dev        # run backend and frontend concurrently
npm run build      # build backend and frontend
npm run start      # start backend and frontend in production mode
npm run type-check # type-check backend and frontend
```

### Backend
```bash
npm run dev        # tsx watch mode
npm run build      # tsc compile
npm run start      # node dist/server.js
npm run prisma:migrate        # prisma migrate dev
npm run prisma:migrate:deploy # prisma migrate deploy (production)
npm run prisma:studio         # prisma studio
```

### Frontend
```bash
npm run dev        # next dev
npm run build      # next build
npm run start      # next start
npm run lint       # next lint
```

---

## Environment Variables Reference

### Backend `.env`
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | — | Min 32 chars |
| `JWT_REFRESH_SECRET` | ✅ | — | Min 32 chars |
| `JWT_ACCESS_EXPIRES_IN` | — | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Refresh token TTL |
| `PORT` | — | `5001` | Server port |
| `CORS_ORIGIN` | — | `http://localhost:3000` | Allowed CORS origin |
| `NODE_ENV` | — | `development` | `development` or `production` |

### Frontend `.env.local`
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL |
