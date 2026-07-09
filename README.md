# Task Tracker — Full-Stack Application

A full-stack task management application with authentication, role-based access control, real-time updates, filtering, pagination, and a per-task change history. Built as a monorepo with a **Spring Boot** backend, a **Next.js** frontend, and **PostgreSQL** persistence.

> Submitted for the *Software Engineer (Full Stack – Backend Focused)* take-home assignment.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
  - [1. Clone](#1-clone)
  - [2. Database setup](#2-database-setup)
  - [3. Backend setup](#3-backend-setup)
  - [4. Frontend setup](#4-frontend-setup)
- [Environment configuration](#environment-configuration)
- [API documentation](#api-documentation)
- [Authentication model](#authentication-model)
- [Real-time updates](#real-time-updates)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Design decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Remaining work & future improvements](#remaining-work--future-improvements)

---

## Features

**Authentication & authorization**
- User registration and login (JWT-based)
- Logout
- Role-Based Access Control: `USER` and `ADMIN`

**Task management (CRUD)** — title, description, status, due date, owner
- `USER`: create / view / update / delete **their own** tasks
- `ADMIN`: view and manage **all** tasks

**Task listing**
- Pagination (with a configurable page size)
- Filter by **status**
- Filter by **owner** (admin)
- Bonus: keyword search (title/description) and **created / due date-range** filters

**Validation & error handling**
- Request validation on all write endpoints
- Consistent error envelope with meaningful messages and correct HTTP status codes

**Real-time updates**
- Connected clients receive task create/update/delete events live via **Server-Sent Events (SSE)** — no page refresh

**Additional**
- Per-task **change history** (who changed what field, from → to, and when)
- OpenAPI / Swagger UI

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 4, Spring Security, Spring Data JPA, JJWT |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, axios |
| Database | PostgreSQL (Neon in production) |
| Realtime | Server-Sent Events (`SseEmitter` / `EventSource`) |
| Docs | springdoc-openapi (Swagger UI) |
| Build | Maven (backend), pnpm (frontend) |

---

## Architecture overview

```
┌────────────────────┐        HTTPS / JSON         ┌──────────────────────┐
│   Next.js frontend │ ──────────────────────────▶ │  Spring Boot backend  │
│  (App Router, SPA) │  Authorization: Bearer JWT  │   REST API + SSE      │
│                    │ ◀───────── SSE stream ───── │                       │
└────────────────────┘                              └───────────┬──────────┘
                                                                 │ JPA / JDBC
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │   PostgreSQL     │
                                                        └──────────────────┘
```

- **Layered backend**: `controller` → `service` (+ `service.impl`) → `repository`, with `dto`, `mapper`, `model`, `security`, `config`, `messaging` (SSE) and `common` (response envelope, error codes, exceptions) packages. Clear separation of concerns.
- **Stateless auth**: identity comes from a signed JWT on every request; no server session.
- **Owner-scoped queries**: the owner id comes from the authenticated principal, never the request body, so a user can never act on another user's tasks.
- **Frontend**: `app/` route groups (`(auth)`, `(dashboard)`), a typed axios client in `lib/`, API calls isolated in `services/`, and reusable UI in `components/`.

---

## Repository structure

```
task-manager/
├── task-manager-backend/      # Spring Boot API
│   ├── src/main/java/me/savindu/task_manager_backend/
│   │   ├── controller/        # REST + SSE endpoints
│   │   ├── service/           # use-cases + authorization
│   │   ├── repository/        # Spring Data JPA
│   │   ├── model/             # JPA entities
│   │   ├── dto/               # request/response records
│   │   ├── mapper/            # entity ↔ DTO
│   │   ├── security/          # JWT filter, handlers, cookie service
│   │   ├── messaging/         # SSE stream + task events
│   │   ├── config/            # security, CORS, properties, seeders
│   │   └── common/            # ApiResponse envelope, error/success codes
│   └── src/main/resources/application.properties
├── task-manager-front/        # Next.js app
│   ├── app/(auth)/            # login, register
│   ├── app/(dashboard)/       # my-task, admin/tasks
│   ├── components/            # UI + task views
│   ├── services/              # API call layer
│   ├── lib/                   # types, axios client, token store
│   └── hooks/                 # SSE hook, row actions
└── README.md
```

---

## Prerequisites

- **JDK 17+**
- **Node.js 20+** and **pnpm** (`npm i -g pnpm`)
- **PostgreSQL 15+** (local) or a free **Neon** database
- Maven is provided via the `mvnw` wrapper — no separate install needed

---

## Getting started

### 1. Clone

```bash
git clone <your-repo-url>
cd task-manager
```

### 2. Database setup

Pick **one** option.

**Option A — Local PostgreSQL via Docker:**
```bash
docker run -d --name task-db \
  -e POSTGRES_DB=taskmanager \
  -e POSTGRES_USER=taskuser \
  -e POSTGRES_PASSWORD=taskpass \
  -p 5432:5432 postgres:16
```
JDBC URL: `jdbc:postgresql://localhost:5432/taskmanager`

**Option B — Neon (serverless Postgres):** create a project at neon.tech and copy the **pooled** connection string; convert it to JDBC form:
`jdbc:postgresql://<host>/<db>?sslmode=require`

The schema is created automatically on first startup (`JPA_DDL_AUTO=update`) — no manual migration required.

### 3. Backend setup

```bash
cd task-manager-backend
cp .env.example .env      # then fill in the values (see Environment configuration)
./mvnw spring-boot:run    # Windows: .\mvnw.cmd spring-boot:run
```
The API starts on **http://localhost:5000**. A bootstrap admin account is seeded on first run (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

- Swagger UI: http://localhost:5000/swagger-ui/index.html
- OpenAPI JSON: http://localhost:5000/v3/api-docs

### 4. Frontend setup

```bash
cd task-manager-front
cp .env.example .env.local          # set NEXT_PUBLIC_API_URL=http://localhost:5000
pnpm install
pnpm dev
```
The app starts on **http://localhost:3000**.

> Make sure the backend's `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` and the frontend's `NEXT_PUBLIC_API_URL` points at `http://localhost:5000`.

---

## Environment configuration

### Backend (`task-manager-backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DB_URL` | ✅ | — | JDBC URL, e.g. `jdbc:postgresql://localhost:5432/taskmanager` |
| `DB_USERNAME` | ✅ | — | Database user |
| `DB_PASSWORD` | ✅ | — | Database password |
| `JWT_SECRET` | ✅ | — | Base64-encoded key, ≥ 256 bits (`openssl rand -base64 48`) |
| `ADMIN_PASSWORD` | ✅ | — | Password for the seeded admin |
| `ADMIN_EMAIL` | | `admin@example.com` | Seeded admin email |
| `ADMIN_NAME` | | `System Administrator` | Seeded admin name |
| `SERVER_PORT` | | `5000` | HTTP port |
| `JPA_DDL_AUTO` | | `update` | Hibernate schema mode (`update` locally, `validate` once stable) |
| `JWT_ACCESS_EXPIRATION_MS` | | `3600000` | Token lifetime (1 hour) |
| `AUTH_COOKIE_SECURE` | | `false` | `true` only over HTTPS |
| `AUTH_COOKIE_SAMESITE` | | `Lax` | `None` for cross-site (needs `Secure=true`) |
| `CORS_ALLOWED_ORIGINS` | | `http://localhost:3000` | Comma-separated allowed origins |

### Frontend (`task-manager-front/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL, e.g. `http://localhost:5000`. **Inlined at build time.** |

Real values live in `.env` / `.env.local`, which are git-ignored; only `.env.example` templates are committed.

---

## API documentation

All responses use a consistent envelope:
```json
{ "success": true, "code": "DATA_RETRIEVED", "message": "...", "timestamp": "...", "data": { } }
```

**Auth** (`/api/auth`)
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | public | Register a `USER`; returns `{ token, user }` |
| POST | `/login` | public | Authenticate; returns `{ token, user }` |
| POST | `/logout` | public | Clear the auth cookie |
| GET | `/me` | authenticated | Current user |

**Tasks** (`/api/tasks`) — scoped to the current user
| Method | Path | Description |
|---|---|---|
| GET | `/` | List own tasks (see query params below) |
| POST | `/` | Create a task |
| GET | `/{id}` | Get one task |
| PUT | `/{id}` | Update a task |
| DELETE | `/{id}` | Delete a task |
| GET | `/{id}/history` | Change history for a task |
| GET | `/stream` | SSE stream of the user's task changes |

**Admin tasks** (`/api/admin/tasks`, role `ADMIN`) — same shape across **all** tasks, plus `GET /` supports an `ownerId` filter and `/stream` streams all task changes.

**List query parameters** (`GET /api/tasks` and `/api/admin/tasks`):
`status`, `ownerId` (admin), `keyword`, `dueFrom`, `dueTo`, `createdFrom`, `createdTo` (ISO-8601), `page`, `size`, `sortBy`, `sortDirection`.

Interactive docs are available at `/swagger-ui/index.html`. A **Postman collection + environment** are provided in [`docs/postman/`](docs/postman) *(see Remaining work if not yet present)*.

---

## Authentication model

- On **login/register** the backend returns a signed JWT in the response body **and** sets an HTTP-only cookie.
- The frontend stores the token and sends it as `Authorization: Bearer <token>` on every request (via an axios interceptor). This makes the app work cleanly across origins (e.g. a Vercel frontend + a separate API) where third-party cookies are unreliable.
- The backend's JWT filter accepts the token from the `Authorization` header, the cookie (same-origin), or a `?token=` query parameter (used by the SSE stream, since `EventSource` cannot set headers).
- Authorization: `/api/admin/**` requires `ADMIN`; all other endpoints require authentication; user-scoped endpoints additionally enforce ownership at the query level.

---

## Real-time updates

Task changes are pushed to connected clients over **Server-Sent Events**:
- The service layer raises an internal event **after the transaction commits**, so clients never see a rolled-back change.
- A registry (`TaskStreamService`) fans the event out to the owner's stream and to admin streams; a heartbeat keeps idle connections alive.
- The frontend subscribes with `EventSource` and reconciles its local list on `CREATED` / `UPDATED` / `DELETED` events — no polling, no refresh.

---

## Testing

Run the backend test suite:
```bash
cd task-manager-backend
./mvnw test
```
Run the frontend lint/type checks:
```bash
cd task-manager-front
pnpm lint
pnpm exec tsc --noEmit
```
> **Coverage:** JUnit 5 integration tests (`@SpringBootTest` + `MockMvc`, in-memory **H2** — no external DB needed) covering registration/login, JWT + **RBAC** (USER vs ADMIN), task **CRUD**, per-user **ownership isolation**, and request **validation** — 18 tests plus a context-load smoke test (19 total).

---

## CI/CD

- **Continuous Deployment** is handled by a **Jenkins** pipeline (`Jenkinsfile`) that, on each push to `main`, runs backend tests against a disposable PostgreSQL container, builds the Docker image, and redeploys the backend.
- A **GitHub Actions** workflow (install → lint → test on push and pull request) is the outstanding CI item — see [Remaining work](#remaining-work--future-improvements).

---

## Deployment

The application is deployed as:
- **Frontend** → Vercel (auto-deploys on push).
- **Backend** → a Dockerised Spring Boot container on a Linux host behind **Caddy** (automatic HTTPS), connected to **Neon** PostgreSQL.
- Because `NEXT_PUBLIC_API_URL` is inlined at build time, the frontend is built pointing at the deployed API's HTTPS URL, and the backend allows that origin via CORS with `SameSite=None; Secure` cookies / Bearer tokens.

---

## Design decisions

- **Monorepo** (`task-manager-backend` + `task-manager-front`) for a single, reviewable submission.
- **JWT (stateless)** over server sessions — simpler horizontal scaling; token returned in the body **and** cookie so the app works both same-origin and cross-origin.
- **SSE** over WebSockets for real-time — updates are one-directional (server → client) and SSE is simpler, auto-reconnects, and rides over plain HTTP; all writes still go through REST.
- **After-commit events** for real-time so clients are never notified of rolled-back changes.
- **Standard response envelope** (`ApiResponse`) + a central `GlobalExceptionHandler` mapping business/validation exceptions to meaningful, coded messages and correct HTTP statuses.
- **Owner-scoped repository queries** and `@EntityGraph` eager-loading of owner/status to enforce isolation and avoid N+1 queries.
- **DTO + mapper layers** so entities are never exposed directly.
- **Optional filters via `coalesce(:param, column)`** so unset filters don't require null-typed SQL parameters (avoids Postgres type-inference errors).

---

## Assumptions

- A single bootstrap admin is seeded on startup; additional admins are promoted directly in the database.
- Task status is a fixed reference set: `TODO`, `IN_PROGRESS`, `DONE`.
- Dates are stored/transferred as ISO-8601 instants (UTC).
- `JPA_DDL_AUTO=update` manages the schema for this assignment; a migration tool would be used in production.
- One user role per account (`USER` or `ADMIN`).

---

## Remaining work & future improvements

**Remaining (to fully satisfy the brief):**
- **GitHub Actions CI** — a `.github/workflows/ci.yml` running install → lint → test for both apps on push and pull request.
- **Postman collection & environment** — export covering every endpoint with a `baseUrl`/token environment, committed under `docs/postman/`.

**Future improvements:**
- Flyway/Liquibase migrations instead of `ddl-auto`.
- Refresh tokens + token rotation.
- Full-text search and saved filters.
- Rate limiting and audit logging.
- Historical metrics/dashboards for tasks.
```
