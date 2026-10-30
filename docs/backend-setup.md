# Backend and authentication setup

The API uses Fastify, PostgreSQL and Better Auth. Google and GitHub sign-in use server-side OAuth callbacks and seven-day, database-backed sessions. Provider credentials are required for real sign-in; missing providers are disabled in development.

## Requirements

- Node.js 22.12 or newer and npm. This milestone was checked with Node.js 24.
- A running PostgreSQL instance.
- Google Web application OAuth credentials and GitHub OAuth application credentials.

Use one application address consistently: http://127.0.0.1:5173. Switching between localhost and 127.0.0.1 changes browser storage and authentication origins.

## Database

Create a dedicated login and two databases using a PostgreSQL administrator. Replace the example password before running these statements:

```sql
CREATE ROLE codetogether_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD 'choose-a-local-password';
CREATE DATABASE codetogether OWNER codetogether_app;
CREATE DATABASE codetogether_test OWNER codetogether_app;
```

The second database is exclusively for integration tests. No test falls back to DATABASE_URL. The integration runner requires a TEST_DATABASE_URL database name ending in _test.

On the original Windows development computer, a project-local PostgreSQL distribution and data directory are present under ignored .runtime/. Manage that instance with:

```sh
npm run db:start
npm run db:status
npm run db:stop
```

These commands manage that initialized project-local instance only. PostgreSQL binaries and database files are not part of a clone; other computers can use an ordinary PostgreSQL installation instead. The local instance listens on 127.0.0.1:5432 and uses password authentication.

## Environment

Copy .env.example to .env at the repository root and fill the values. The existing private .env on the original development computer already contains generated application/database secrets; preserve them.

| Variable | Meaning |
| --- | --- |
| DATABASE_URL | Application PostgreSQL connection string |
| TEST_DATABASE_URL | Separate integration-test database connection string |
| BETTER_AUTH_SECRET | Random authentication/encryption secret of at least 32 characters |
| BETTER_AUTH_URL | Public app origin; locally http://127.0.0.1:5173 |
| PORT | API port; locally 3001 |
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET | Google Web OAuth client credentials |
| GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET | GitHub OAuth app credentials |

Never prefix server secrets with VITE_. Never commit .env, PostgreSQL data, credential files, or logs. Keep BETTER_AUTH_SECRET stable: changing it invalidates signed sessions and affects decryption of stored OAuth tokens.

## Google configuration

Create a Google Cloud project and configure Google Auth Platform branding, audience and consent settings. Create a client of type Web application:

- JavaScript origin: http://127.0.0.1:5173
- Redirect URI: http://127.0.0.1:5173/api/auth/callback/google
- Add development test accounts where required by the consent/audience configuration.

Only basic identity scopes are requested. See the [Google provider documentation](https://better-auth.com/docs/authentication/google).

## GitHub configuration

Create a GitHub OAuth application, separate from Git's saved credentials:

- Homepage: http://127.0.0.1:5173
- Callback: http://127.0.0.1:5173/api/auth/callback/github

The integration requests profile and email access, not repository access. The provider implementation retrieves private email addresses using the authorized email endpoint. See the [GitHub provider documentation](https://better-auth.com/docs/authentication/github).

## Start and verify

```sh
npm ci
npm run db:migrate
npm run dev
```

Open http://127.0.0.1:5173 and choose Sign in. The development command runs both Vite and the API. Saving .env restarts the development API; reload or refocus the app to refresh provider availability. Both fields for a provider must be supplied together.

The Vite development proxy forwards /api to http://127.0.0.1:3001. In production, configure an equivalent reverse proxy, an explicit HTTPS BETTER_AUTH_URL, both providers, and production callback registrations. Vite preview serves a static production build; it is not the full-stack deployment server.

The API also has separate commands:

```sh
npm run dev:api
npm run dev:web
npm run typecheck
npm test
npm run test:integration
npm run build
```

## Endpoints

| Endpoint | Behaviour |
| --- | --- |
| GET /api/health | Process health |
| GET /api/ready | Database connectivity; 503 when unavailable |
| GET /api/auth/providers | Configuration availability booleans, without credentials |
| GET /api/me | Safe current-user profile and connected provider names; 401 when signed out |
| POST /api/auth/sign-in/social | Start the selected provider flow |
| GET /api/auth/callback/google | Google authorization-code callback |
| GET /api/auth/callback/github | GitHub authorization-code callback |
| POST /api/auth/link-social | Start explicit provider linking for a verified, recently signed-in account |
| POST /api/auth/sign-out | Revoke the session and expire its cookie |

Other Better Auth HTTP endpoints are not exposed. No development-login bypass is installed.

## Account linking and local drafts

- A provider identity maps to an internal user ID.
- Same-email identities are not automatically merged. Sign in with the original provider, then choose Connect in the account dialog.
- Explicit linking requires the same verified email and a sign-in within the last ten minutes. Different-email identities remain separate accounts.
- Logout invalidates the server session, not just the displayed profile.
- Session data is not stored in localStorage. Stored OAuth access/refresh tokens are encrypted with the authentication secret; identity tokens are discarded after callback verification and are not exposed through the profile endpoint.
- Code drafts are still browser-local and are not assigned to the signed-in account or uploaded. Other people using that browser profile can access those drafts.

## Migrations

Versioned SQL is in apps/api/src/db/migrations. The runner records checksums, uses a database lock, and applies each migration in a transaction. It refuses an already-applied migration whose contents changed. Normal migration execution does not reset the database.

The initial authentication schema was generated from the pinned Better Auth version; additional SQL supplies provider-identity uniqueness and lookup/expiry indexes. Build output includes the SQL migrations.

## Verification limits

See [authentication verification](auth-verification.md) for actual test results. Simulated provider responses test the integration code; they do not establish that a user's live provider applications are correctly registered. Real Google/GitHub consent and login must be checked with the configured applications.


## Address mismatch during local sign-in

If account requests fail while using http://localhost:5173, open http://127.0.0.1:5173 instead. The registered callbacks and application origin use 127.0.0.1. Do not loosen origin checks to solve a host mismatch. Browser drafts and cookies are separate for the two addresses; do not clear site data to repair this error.