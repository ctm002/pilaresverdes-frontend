# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # TypeScript check + production build
npm run lint         # ESLint (strict: --max-warnings 0)
npm run preview      # Preview production build locally
npm run dev:prod     # Dev server in production mode
```

## Architecture

React 18 + TypeScript SPA using Vite. React Router v7 for client-side routing, Tailwind CSS v4 for styling, Axios for HTTP.

### Key directories

- `src/api/` — Centralized Axios instance with JWT auth interceptors and auto-refresh logic
- `src/components/` — Reusable UI components (some use CSS modules)
- `src/dto/` — TypeScript data transfer object interfaces
- Root-level files in `src/` are pages (Signin, Signup, Avisos, DetalleAviso, EditarAviso, ForgotPassword)

### Routing

All routes are defined in `src/Menu.tsx`:

| Path | Component |
|------|-----------|
| `/signin` | Signin |
| `/signup` | Signup |
| `/forgot-password` | ForgotPassword |
| `/avisos` | Avisos (listing index) |
| `/avisos/:slug` | DetalleAviso |
| `/avisos/:slug/editar` | EditarAviso |
| `/crear` | Create listing |
| `/` | Redirect → `/avisos` |

### API layer

`src/api/axios.ts` exports a configured Axios instance:
- Proxies all `/api` requests to `VITE_PROXY_TARGET` via Vite's dev proxy
- Request interceptor: attaches JWT from `localStorage`, auto-refreshes tokens expiring within 5 minutes (uses promise caching to prevent duplicate refresh calls)
- Response interceptor: redirects to `/signin` on 401

Base paths used: `/api/v1/auth/*` for auth, `/api/v1/avisos/*` for listings.

### State management

No global state library. Each page component manages its own state with `useState`. Auth token stored in `localStorage` as a JWT.

## Environment

`.env.development` sets `VITE_PROXY_TARGET=http://localhost:9090` (local backend).  
`.env.production` sets `VITE_PROXY_TARGET=http://backend-api:9090` (Docker internal network).

## TypeScript

Strict mode is on (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). The lint step enforces zero warnings. Fix all TypeScript and ESLint errors before building.

## Deployment

Docker multi-stage build: Node 22 alpine → Nginx. Accepts `VITE_BUILD_HASH` build arg. Run `npm run build` inside Docker, output served from `dist/` via Nginx.
