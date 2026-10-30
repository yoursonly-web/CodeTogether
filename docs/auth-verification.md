# Backend and authentication verification — 30 October 2026

## Implemented

- Fastify/TypeScript API, strict environment validation and PostgreSQL connection pool.
- Health, database readiness, provider-configuration and protected profile endpoints.
- Google/GitHub OAuth integration, database-backed signed-cookie sessions and server logout.
- Explicit provider linking, verified-email checks, recent-login checks and no implicit account merging.
- Encrypted stored OAuth tokens; no token retrieval or development-login HTTP endpoint exposed.
- Request limits and origin checks; auth logs omit callback queries and secret headers.
- Versioned transactional SQL migrations, checksum checks and a migration lock.
- Account dialog, guest mode, provider availability, profile, linking and sign-out UI.

## Automated evidence

The existing eight frontend data-model tests and six backend unit tests passed.

Thirteen PostgreSQL integration scenarios passed against a separate test database:

1. Health, readiness, guest rejection, configuration flags and endpoint restrictions.
2. Untrusted origin and external redirect rejection, guest-linking rejection and oversized input rejection.
3. Invalid callback state does not create a signed-in session.
4. A simulated GitHub code exchange creates a signed HttpOnly/SameSite cookie; profile output omits tokens; stored provider tokens decrypt correctly and are not plaintext.
5. Recreating the backend preserves a valid database-backed session.
6. Repeated provider login does not create duplicate users/accounts.
7. A different provider identity with the same email is not implicitly linked.
8. Forged and expired sessions are rejected.
9. Explicit linking requires a verified email and recent login; an allowed Google flow produces state and a PKCE challenge.
10. Logout clears the cookie and revokes the database session.
11. Replaying migrations changes nothing; the app role is not a superuser; identity indexes exist.
12. Database failure returns 503 without leaking configuration.
13. Identity assertions are discarded on account creation and update; direct ID-token sign-in is not exposed.

Provider HTTP responses in these automated tests are simulated. No test-only provider or login route is enabled in the application.

## Build and browser evidence

- Frontend and backend TypeScript checks passed.
- Both production builds passed, including migration SQL in backend output. The existing large Monaco client-bundle warning remains.
- The actual browser app loaded through the Vite API proxy.
- The account dialog initially displayed missing providers as disabled with Not configured labels. GitHub became available after its credentials were configured; the API now reports both providers configured.
- Returning to the local editor worked; existing browser draft content remained available after reload.

## Live provider verification

The owner completed the following in their system browser on 30 October 2026:

- Google account selection/consent and return to a real CodeTogether profile.
- Explicit GitHub connection, with both methods visible in the same profile.
- Sign-out back to guest mode.
- Independent GitHub sign-in followed by refresh, retaining the same linked profile.

Database checks confirmed a linked account with both provider identities, an active session for that linked account, and zero retained identity tokens. Safe server logs recorded successful provider callbacks, profile requests and logout. No personal profile details, authorization codes, cookies, or provider credentials are included in this evidence.

Live UI outcomes are reported by the owner; account/session persistence and request outcomes were checked directly. The agent could not automate inspection of the system browser.

The local test also identified an origin mismatch: localhost:5173 is not the configured 127.0.0.1:5173 authentication origin. The application continues to reject the wrong origin and now displays an actionable message.

## Not yet established

- Provider-specific cancellation and external provider-grant revocation beyond the tested application logout flow.
- Production HTTPS/reverse-proxy deployment or multi-instance rate-limit coordination.
- Shared editing, room permissions and code execution; this milestone does not implement those systems.
