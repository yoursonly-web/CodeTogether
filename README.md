# CodeTogether

A web-based code editor for **Python, C++, and Java**, with a Fastify/PostgreSQL backend and Google/GitHub sign-in.

**Current status:** local editing, browser draft recovery, database-backed authentication, explicit provider linking, logout, and session recovery have been verified locally. Shared editing and code execution are not connected; the Run button is disabled and result examples are labelled UI previews.

## Current features

- Monaco Editor with syntax highlighting, indentation, find/replace, and local undo/redo.
- Create, search, and switch local workspaces with independent source code and standard input.
- Python (`main.py`), C++17 (`main.cpp`), and Java (`Main.java`) editing profiles.
- Browser draft saving, refresh recovery, invalid-data handling, and cross-tab change warnings.
- Font-size preferences, word wrap, focus mode, source copy, and file download.
- Standard input, output/error/details panels, and labelled example execution states.
- Google and GitHub OAuth sign-in with server-managed, database-backed sessions.
- Explicitly connect both providers to one account using the same verified email.
- Server-side logout, protected profile access, origin checks, and request limits.
- PostgreSQL migrations with transactions, checksums, and migration locking.

Language profiles currently support **editing only**. No compiler or interpreter runs submitted code.

## Planned features

The following features are **not implemented yet**:

| Area | Planned behaviour |
| --- | --- |
| Shared rooms | Two or three authenticated members work in one room, with a maximum of three members including the owner |
| Room access | Create rooms, invite members, and enforce owner/editor permissions on the server |
| Concurrent editing | Merge simultaneous edits with Yjs CRDTs and a Monaco binding, instead of replacing the entire document |
| Live presence | Display connected members, named cursors, and selections |
| Shared persistence | Store collaborative document state in PostgreSQL and show accurate saving/error feedback |
| Reconnection | Reauthorize users and resynchronize the shared document after an interrupted connection |
| Code execution | Execute Python, C++, and Java through an isolated server-side execution service with preset time/memory limits, bounded output, and submission quotas |
| Real execution results | Show compilation, runtime, and resource-limit outcomes tied to the exact submitted source and input |
| Deployment and reliability | Provide HTTPS/WSS access and evaluate authorization, failure recovery, and a measured multi-room workload |

### Next phase: authorized rooms and collaborative editing

Authentication and the database foundation are in place. The next implementation phase will connect them to shared workspaces:

1. Add room, membership, and invitation records and APIs.
2. Enforce access permissions and the three-member cap, including simultaneous join attempts.
3. Connect authenticated room WebSockets to Yjs and Monaco for shared editing.
4. Add participant presence, live cursors, and selections.
5. Persist collaborative document state and distinguish synchronized changes from confirmed database saves.
6. Handle refresh, reconnect, room switching, and revoked access without duplicating starter content.
7. Validate the workflow with two and three accounts and reject unauthorized access and fourth-member admission.

**Milestone:** two or three signed-in users can edit the same file, see each other's cursors, and recover saved shared content after reload. Real code execution is a separate subsequent milestone.

### Later improvements

- Version history, named checkpoints, and restoration.
- Viewer permissions and more flexible room controls.
- Multi-file workspaces and additional programming languages.
- Larger rooms and additional collaboration servers after capacity testing.
- Richer execution history and operational metrics.

These are public development goals, not claims about the current application.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7 |
| Editor | Monaco Editor and @monaco-editor/react |
| Interface | CSS and Lucide React |
| Backend | Node.js, TypeScript, Fastify |
| Authentication | Better Auth with Google/GitHub OAuth |
| Database | PostgreSQL through pg |
| Draft persistence | Browser localStorage |
| Verification | Node.js test runner, TypeScript, production builds |

## Requirements

- Node.js **22.12 or newer** and npm. Node.js 24 was used for verification.
- Git.
- A running PostgreSQL instance. PostgreSQL 18.6 was used locally.
- A modern desktop browser.
- Google Web application OAuth credentials and GitHub OAuth application credentials for sign-in.

The commands below use Windows PowerShell and `npm.cmd` to avoid execution-policy issues with npm.ps1. Use `npm` where your shell supports it. The checked development environment is Windows; the API's automatic path-watching development command is intended for Windows/macOS.

## Setup

### 1. Clone the repository and install dependencies

```powershell
git clone https://github.com/yoursonly-web/CodeTogether.git
cd CodeTogether
npm.cmd ci
```

### 2. Prepare PostgreSQL

Start PostgreSQL, then use an administrator connection in psql or pgAdmin to create a dedicated application role and databases. Replace the example password first:

```sql
CREATE ROLE codetogether_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'choose-a-local-password';
CREATE DATABASE codetogether OWNER codetogether_app;
CREATE DATABASE codetogether_test OWNER codetogether_app;
```

`codetogether_test` is a separate database for integration tests. The tests require its name to end in `_test` and do not fall back to the application database.

On the original development computer, an initialized PostgreSQL instance exists in the ignored `.runtime` directory. Its Windows-only helpers are:

```powershell
npm.cmd run db:start
npm.cmd run db:status
npm.cmd run db:stop
```

Those helpers manage that existing local instance; they do not download or initialize PostgreSQL for a fresh clone. On another computer, use your PostgreSQL installation and configure its connection string below.

### 3. Configure the environment

Create a root `.env` from the example only if one does not already exist:

```powershell
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Fill these values in `.env`:

| Variable | Value or purpose |
| --- | --- |
| `NODE_ENV` | `development` for local work |
| `PORT` | `3001` |
| `BETTER_AUTH_URL` | `http://127.0.0.1:5173` |
| `DATABASE_URL` | `postgresql://codetogether_app:YOUR_PASSWORD@127.0.0.1:5432/codetogether` |
| `TEST_DATABASE_URL` | `postgresql://codetogether_app:YOUR_PASSWORD@127.0.0.1:5432/codetogether_test` |
| `BETTER_AUTH_SECRET` | A generated random secret of at least 32 characters |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credentials from your Google OAuth client |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Credentials from your GitHub OAuth app |

Generate an authentication secret locally, then copy the result into `BETTER_AUTH_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

URL-encode reserved characters in a database password when placing it in a connection string. Keep the authentication secret stable: changing it invalidates existing signed sessions and affects stored token decryption.

`.env` is private and ignored by Git. Only the placeholder `.env.example` belongs in the repository. Do not put server secrets in `VITE_` variables.

### 4. Register Google sign-in

In Google Cloud Console, select or create a project, configure Google Auth Platform branding/audience, and create an OAuth client of type **Web application**:

| Google setting | Local value |
| --- | --- |
| Authorized JavaScript origin | `http://127.0.0.1:5173` |
| Authorized redirect URI | `http://127.0.0.1:5173/api/auth/callback/google` |

Add your Google account as a test user where required by the audience/testing configuration. Put the client ID and client secret in `.env`.

The integration requests basic identity information. See the [Google provider setup](https://better-auth.com/docs/authentication/google).

### 5. Register GitHub sign-in

Create a GitHub **OAuth application** in your developer settings. This is separate from Git's saved credentials:

| GitHub setting | Local value |
| --- | --- |
| Application name | `CodeTogether` |
| Homepage URL | `http://127.0.0.1:5173` |
| Authorization callback URL | `http://127.0.0.1:5173/api/auth/callback/github` |

Generate its client secret and put both credentials in `.env`. Sign-in requests profile and email access, not repository access. See the [GitHub provider setup](https://better-auth.com/docs/authentication/github).

Both fields for a provider must be supplied together. Missing providers are disabled in development; production configuration requires both.

### 6. Apply migrations and start the application

From the repository root:

```powershell
npm.cmd run db:migrate
npm.cmd run dev
```

Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your system browser.

The development command starts both the frontend and API:

| Service | Local address |
| --- | --- |
| Web app | `http://127.0.0.1:5173` |
| API | `http://127.0.0.1:3001` |
| PostgreSQL | `127.0.0.1:5432` with the example connection strings |

Vite forwards `/api` requests to the API. Saving `.env` restarts the development API; refocus or reload the browser to refresh provider availability.

Use **127.0.0.1 consistently**. `localhost:5173` is a different authentication origin and has separate browser drafts and cookies. If sign-in is rejected at localhost, open the exact address above rather than weakening origin checks or clearing site data.

For the editor alone, run `npm.cmd run dev:web`. Editing remains usable without the API, but account access is unavailable. No Docker installation or execution service is required for this milestone.

## Check authentication

1. Choose **Sign in → Continue with Google** and complete account selection/consent.
2. Confirm your profile appears.
3. If GitHub uses the same verified email, choose **Connect GitHub** from the account dialog. Linking also requires a sign-in within the last ten minutes.
4. Confirm both providers appear as connected.
5. Sign out, sign back in with GitHub, and refresh to check session recovery.

Providers are never silently merged because their emails match. Different-email identities remain separate accounts; test them by signing out before using the other provider.

Sessions are database-backed with a seven-day expiry. Cookies are HttpOnly and use SameSite protections; HTTPS configuration enables secure cookies. Stored OAuth access/refresh tokens are encrypted, identity tokens are discarded after callback verification, and profile responses do not expose credentials.

Signing in **does not upload browser drafts or attach them to an account**. Other people using the same browser profile can access those local drafts.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the frontend and API |
| `npm run dev:web` | Start only the frontend |
| `npm run dev:api` | Start only the development API |
| `npm run db:migrate` | Apply pending versioned migrations without resetting the database |
| `npm test` | Run frontend-model and backend unit tests |
| `npm run test:integration` | Run PostgreSQL integration tests against TEST_DATABASE_URL |
| `npm run typecheck` | Check frontend and backend TypeScript |
| `npm run build` | Build the frontend and backend, including migration SQL |
| `npm run preview` | Preview the static frontend build, normally on port 4173 |

Build output is in `apps/web/dist` and `apps/api/dist`. Vite preview is a static frontend preview, not a full-stack deployment server. Production requires an HTTPS application origin, matching provider callbacks, and a reverse proxy routing `/api` to the backend.

## Health checks

| Endpoint | Expected behaviour |
| --- | --- |
| `GET /api/health` | Confirms the API responds |
| `GET /api/ready` | Confirms database connectivity; returns 503 when unavailable |
| `GET /api/auth/providers` | Reports configured providers without revealing credentials |
| `GET /api/me` | Returns the signed-in profile; returns 401 when signed out |

## Verification

Verified locally on **30 October 2026**:

- Eight frontend-model tests and six backend unit tests passed.
- Thirteen PostgreSQL integration scenarios passed.
- TypeScript checks and both production builds passed.
- The owner confirmed real Google login, GitHub linking, logout, independent GitHub re-login, and refresh recovery in their system browser.
- Database and safe request-log checks confirmed linked identities, active sessions, and zero retained identity tokens.

Automated provider exchanges use simulated responses. Live browser outcomes are reported by the owner and checked against database/server evidence. The existing large Monaco bundle warning remains.

More detail: [backend setup](docs/backend-setup.md), [authentication verification](docs/auth-verification.md), and [frontend verification](docs/verification.md).

## Project structure

```text
apps/web/        React interface, Monaco, browser drafts, and account controls
apps/api/        Fastify API, authentication, SQL migrations, and backend tests
tests/           Frontend data-model tests
scripts/         Local database helpers
docs/            Setup and verification documentation
.env.example     Placeholder-only configuration template
```

## Current limitations

- Source files are limited to 64 KiB and standard input to 16 KiB, measured in UTF-8 bytes.
- Up to 12 browser-local workspaces are supported.
- Browser drafts do not synchronize between accounts, devices, or tabs.
- Shared rooms, live cursors, and collaborative editing are not connected.
- No submitted code is compiled or executed.
- Desktop browsers are the intended coding environment; a responsive layout does not establish full mobile-editor support.
- Local verification does not establish production deployment, complete accessibility coverage, or production-scale performance.

## License

No project license has been selected. Third-party dependencies retain their respective licenses.