# Helpdesk

The helpdesk is split into a Next.js frontend and a NestJS backend:

- `frontend/` contains the React workspace UI and proxies `/api/*` requests.
- `backend/` contains the JavaScript-only NestJS API, MySQL access, and database
  schema. The NestJS controller delegates to the existing in-process Fastify API
  to preserve all current endpoint behavior.

Ticket, customer, agent, and department lists include a table/chart switch.
Charts use the currently displayed records and update when those records change.
Managers can open a customer or agent ticket history by selecting that person in
the corresponding table, then switch between the ticket table and charts.
The manager overview includes a live online-agent list, updated from agent
heartbeats.

The frontend talks to the backend through a same-origin Next.js rewrite. Set
`BACKEND_URL` on the frontend only when the backend is not at
`http://localhost:4000`.

## Requirements

- Node.js 20.9 or newer
- MySQL 8 or compatible

## Setup

1. Copy the root `.env.example` to `.env` and set `DB_HOST`, `DB_PORT`,
   `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET` (at least 32 characters).
   The backend also loads `backend/.env` if you prefer to keep its configuration
   alongside the backend.
2. Create the configured MySQL database and execute
   [`backend/schema.sql`](./backend/schema.sql). The API also creates and updates
   its required tables on its first request.
3. Install dependencies from the project root with `npm install`.
4. Start both apps with `npm run dev`.
5. Open `http://localhost:3000`. The backend listens on `http://localhost:4000`.

The NestJS backend runs directly on Node.js JavaScript and does not require
TypeScript or Nest CLI compilation. The root `npm run dev` command starts both
workspaces, so you only need one terminal. To run them separately, use `npm run dev:frontend` and
`npm run dev:backend` in two terminals. Use `npm run build` to validate/build
both apps, `npm test` for the frontend unit tests, and `npm start` for production.

The initial manager login seeded by the API is `manager` / `Manager@123`.
Change that password after signing in. Customers can self-register; agent
accounts can be registered after at least one department exists.

## Scripts

- `npm run dev` - run frontend and backend together
- `npm run build` - build both apps
- `npm test` - run frontend chart-data unit tests
- `npm start` - start both production servers
- `npm run dev:frontend` / `npm run dev:backend` - run either app separately
