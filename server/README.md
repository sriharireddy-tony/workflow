# Jira SaaS — multi-tenant API

Node.js + Express + MongoDB (Mongoose) + JWT. Hierarchy: **Client → Project → Feature → Task**, with embedded **members**, **assignments**, and **assignees**.

## Setup

Run all commands from this **`server/`** directory.

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. `npm install`
3. `npm run dev` or `npm start`

API base path: **`/api`**

## Swagger / OpenAPI

- **Interactive UI:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs) (port from `.env`)
- **Raw spec (JSON):** `GET /api/docs.json`

Use **Authorize** and paste `Bearer <token>` or just the JWT (depending on Swagger UI version, usually the token only after selecting bearer scheme). **Try it out** sends requests to the same host; `servers.url` is `/api` so paths align with the app.

## Auth

- `Authorization: Bearer <token>` on protected routes.
- Register creates a **new tenant** (unique `tenantCode`) and the first user as **SUPER_ADMIN**.
- Login requires `tenantCode` + `email` + `password`.

## Main routes

| Area | Methods |
|------|---------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Users | `POST/GET/PUT/DELETE /api/users`, `GET /api/users/:id/projects`, `GET /api/users/:id/tasks` |
| Clients | `POST/GET/PUT/DELETE /api/clients`, `GET /api/clients/:id/projects` |
| Projects | `POST/GET/PUT/DELETE /api/projects`, `POST/GET .../projects/:id/members`, `GET .../projects/:id/features`, `GET .../projects/:id/tasks` |
| Features | `POST/GET /api/features`, `GET /api/features/:id`, `POST /api/features/:id/assign` |
| Tasks | `POST/GET/PUT/DELETE /api/tasks`, `POST /api/tasks/:id/comments` |
| Dashboard | `GET /api/dashboard/client/:clientId/projects-count`, `.../project/:projectId/employees-count`, `.../user/:userId/projects-count`, `.../project/:projectId/summary` |

See `docs/SAMPLE_RESPONSES.md` for example JSON.

## RBAC (summary)

- **SUPER_ADMIN / ADMIN**: full tenant admin (users, clients, projects).
- **MANAGER**: features, tasks, assignments, comments; project members read; dashboards.
- **EMPLOYEE**: projects where member; features if assigned or project member; **only assigned tasks** (list/get/update/comment); limited task fields on update (`status`, `description`).

## Structure

- `src/modules/*` — validation, controllers, services, routes per domain
- `src/models` — Mongoose schemas + indexes
- `src/middleware` — JWT auth, RBAC, errors
- `src/routes/index.js` — mounts all routers

Placeholder folders `src/controllers` and `src/services` document where logic actually lives (`modules/`).
