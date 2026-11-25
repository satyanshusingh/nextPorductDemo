# Helpdesk

A support-ticket workspace for managers, agents, and customers. The application
uses a Next.js/React frontend, a NestJS HTTP server that forwards requests to
the existing Fastify API, and a MySQL database.

## Architecture and request flow

```text
Browser (Next.js UI, http://localhost:3000)
    |
    | /api/* requests; bearer token on authenticated requests
    v
Next.js rewrite (BACKEND_URL, defaults to http://localhost:4000)
    |
    v
NestJS controller (backend/src)
    |
    | forwards the request in-process
    v
Fastify API (backend/server.js)
    |
    | SQL queries through mysql2 connection pool
    v
MySQL database
```

The UI calls the API helpers in `frontend/src/api.js`. Next.js proxies those
same-origin `/api/*` requests to the backend. The NestJS controller passes each
request to Fastify in-process, preserving the existing API routes and behavior.
Fastify validates input and bearer-token access, then reads or writes MySQL.
Successful sign-in returns a short-lived JWT; the frontend sends it as a bearer
token for authenticated requests.

## Application structure

```text
backend/
  schema.sql                 SQL schema and optional sample records
  server.js                  Fastify routes, MySQL setup, auth, and business logic
  src/
    main.js                  NestJS bootstrap, CORS, and API port
    app.module.js             NestJS module registration
    api.controller.js         Forwards NestJS requests to Fastify
    helpdesk-api.service.js   Initializes and provides the Fastify API
frontend/
  app/
    layout.jsx                Page metadata and global CSS
    page.jsx                  Next.js page entry point
  src/
    App.jsx                   Main application state and workflows
    api.js                    Frontend API client
    components/               Dashboard, tickets, forms, tables, and dialogs
    styles.css                Application styles
  next.config.js              API rewrite to the backend
client/                       Auxiliary client assets
public/                       Static assets
test/                         Frontend unit tests
.env.example                  Environment-variable template
package.json                  npm workspaces and combined scripts
```

`client/` and `public/` are not started by the root development scripts; the
active UI is in `frontend/`.

## Technology

- **Frontend:** Next.js 16, React 19, JavaScript, CSS
- **Backend:** Node.js (ES modules), NestJS 11, Fastify 5
- **Database:** MySQL 8 or compatible, accessed with `mysql2`
- **Authentication:** JWT bearer tokens; password hashes use Node.js `scrypt`
- **Development:** npm workspaces and `concurrently`

## Run locally on Windows

### 1. Install prerequisites

- Node.js 20.9 or newer (includes npm)
- MySQL 8 or compatible

Check Node and npm in PowerShell:

```powershell
node --version
npm --version
```

### 2. Start MySQL and create the database

Start the MySQL service from **Services** in Windows. If your installation
registered a service named `MySQL80`, you can instead run PowerShell as
Administrator and use:

```powershell
Start-Service MySQL80
```

Open a MySQL client:

```powershell
mysql -u root -p
```

Create an empty database (choose the same name for `DB_NAME` below):

```sql
CREATE DATABASE helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Use a MySQL account that has permission to create and update tables in this
database. Do not use the example credentials in `.env.example` as real
credentials.

### 3. Configure the application

From the project directory, copy the example environment file and edit `.env`:

```powershell
Copy-Item .env.example .env
```

Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` to match your
MySQL setup. Set `JWT_SECRET` to a private random value at least 32 characters
long. The backend loads `.env` from the project root or `backend/.env`.

### 4. Initialize the database

The API creates and updates its required tables when it starts. To also load the
example customer and run the checked-in SQL schema manually, execute this once
from the project directory:

```powershell
mysql -u root -p helpdesk < backend\schema.sql
```

The script contains sample inserts and is intended for initial setup, not for
repeated execution. The API also seeds the default departments and, when there
are no application users yet, demo login accounts.

The main tables are:

- `customers`, `agents`, and `departments` store people and team information.
- `tickets` connects a customer to an optional assigned agent; foreign keys
  protect these relationships.
- `app_users` stores login usernames, roles, password salts, and password
  hashes, plus links to the related customer or agent record.
- `ticket_messages` stores ticket conversations; deleting a ticket cascades to
  its messages.
- `notifications` stores manager/customer alerts and their read timestamps.

The backend validates the database settings, opens a MySQL connection pool, then
creates/upgrades these tables and seeds initial records before serving API
requests. Set `BACKEND_PORT` to change the backend port; if it is not 4000, also
set `BACKEND_URL` for the frontend.

### 5. Install dependencies and run both apps

From the project directory:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend runs on port
3000 and the backend API on port 4000. Keep the terminal open while using the
app.

The initial manager login is `manager` / `Manager@123` when the database has no
application users. Change this password after signing in. Customers can
self-register; agent accounts can be registered after at least one department
exists.

### Run the applications separately

Run these commands from the project directory, in separate terminals:

```powershell
npm run dev:backend
```

```powershell
npm run dev:frontend
```

### Build and test

```powershell
npm run build
npm test
```

`npm run build` checks the backend JavaScript and builds the frontend. `npm test`
runs the frontend unit tests. `npm start` starts both apps in production mode
after a successful build.

## Scripts

- `npm run dev` - run frontend and backend together
- `npm run dev:frontend` / `npm run dev:backend` - run either app separately
- `npm run build` - validate/build both apps
- `npm test` - run frontend unit tests
- `npm start` - start both production servers
