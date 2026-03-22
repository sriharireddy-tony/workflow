# FlowBoard — React client

Vite + React 18 + React Router 6 + Redux Toolkit + MUI + Axios. Calls the API under `/api` (proxied to `http://localhost:4000` in dev).

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Environment

- Dev: rely on Vite proxy (`vite.config.js`) so requests go to the same origin `/api`.
- Production: set `VITE_API_URL` to your API base (e.g. `https://api.example.com/api`).

## Auth

- JWT is stored in `localStorage` and attached by `apiClient`.
- Register creates a tenant; login requires **tenant code**, email, and password (matches backend).

## Role-based UI

Sidebar and route guards follow your spec (e.g. only **ADMIN / SUPER_ADMIN** reach **Users**; **MANAGER+** for **Clients** and **Features**).

## Structure

- `src/app` — Redux store, theme, providers  
- `src/features/*` — pages + slices per domain  
- `src/components` — layout + reusable UI  
- `src/services/apiClient.js` — Axios instance  
