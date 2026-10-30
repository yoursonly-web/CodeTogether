import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeSignature, symmetricDecrypt } from 'better-auth/crypto';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { createPool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrations.js';

test('PostgreSQL-backed authentication and OAuth boundary checks', async t => {
  const testDatabase = process.env.TEST_DATABASE_URL;
  assert.ok(testDatabase, 'TEST_DATABASE_URL is required. Integration tests never use DATABASE_URL.');
  assert.ok(new URL(testDatabase).pathname.endsWith('_test'), 'Integration database name must end in _test.');
  const config = readConfig({ ...process.env, NODE_ENV: 'test', DATABASE_URL: testDatabase, GOOGLE_CLIENT_ID: 'integration-google', GOOGLE_CLIENT_SECRET: 'integration-google-secret', GITHUB_CLIENT_ID: 'integration-github', GITHUB_CLIENT_SECRET: 'integration-github-secret' });
  const pool = createPool(config.databaseUrl);
  await runMigrations(pool);
  let { app, auth } = await createApp(config, pool, false);
  const originalFetch = globalThis.fetch;
  const email = 'integration-' + randomUUID() + '@example.test';
  let externalId = 'test-' + randomUUID();
  const fakeToken = 'test-only-provider-token-' + randomUUID();
  const json = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
  const cookieHeader = (cookies: string | string[] | undefined) => (Array.isArray(cookies) ? cookies : cookies ? [cookies] : []).map(value => value.split(';')[0]).join('; ');
  const beginGitHub = () => app.inject({ method: 'POST', url: '/api/auth/sign-in/social', headers: { origin: config.origin }, payload: { provider: 'github', callbackURL: config.origin + '/?auth_complete=1', errorCallbackURL: config.origin + '/?auth_error=1' } });
  const completeGitHub = async () => {
    const begin = await beginGitHub();
    assert.equal(begin.statusCode, 200, begin.body);
    const url = new URL(begin.json().url);
    assert.equal(url.hostname, 'github.com');
    return app.inject({ method: 'GET', url: '/api/auth/callback/github?code=test-code&state=' + encodeURIComponent(url.searchParams.get('state') ?? ''), headers: { cookie: cookieHeader(begin.headers['set-cookie']) } });
  };
  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.startsWith('https://github.com/login/oauth/access_token')) return json({ access_token: fakeToken, token_type: 'bearer', scope: 'read:user,user:email' });
    if (url.startsWith('https://api.github.com/user/emails')) return json([{ email, primary: true, verified: true }]);
    if (url.startsWith('https://api.github.com/user')) return json({ id: externalId, login: 'integration-user', name: 'Integration User', email: null, avatar_url: '' });
    throw new Error('Unexpected external network request in integration test: ' + new URL(url).origin);
  };
  t.after(async () => {
    globalThis.fetch = originalFetch;
    await app.close();
    await pool.query('DELETE FROM "user" WHERE email = $1', [email]);
    await pool.query('DELETE FROM "verification" WHERE "expiresAt" < now()');
    await pool.end();
  });

  await t.test('readiness, guest access, provider configuration and unused endpoints', async () => {
    assert.equal((await app.inject('/api/health')).statusCode, 200);
    assert.equal((await app.inject('/api/ready')).statusCode, 200);
    assert.equal((await app.inject('/api/me')).statusCode, 401);
    assert.deepEqual((await app.inject('/api/auth/providers')).json(), { google: true, github: true });
    for (const url of ['/api/auth/get-access-token', '/api/auth/get-session', '/api/auth/list-accounts']) assert.equal((await app.inject(url)).statusCode, 404);
  });
  await t.test('untrusted origins, arbitrary redirect targets, linking as guest and oversized input are rejected', async () => {
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/sign-in/social', headers: { origin: 'https://evil.example' }, payload: { provider: 'github' } })).statusCode, 403);
    const redirect = await app.inject({ method: 'POST', url: '/api/auth/sign-in/social', headers: { origin: config.origin }, payload: { provider: 'github', callbackURL: 'https://evil.example' } });
    assert.ok(redirect.statusCode >= 400 && redirect.statusCode < 500);
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/link-social', headers: { origin: config.origin }, payload: { provider: 'google' } })).statusCode, 401);
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/sign-in/social', headers: { origin: config.origin }, payload: { provider: 'google', idToken: { token: 'not-supported-in-this-app' } } })).statusCode, 400);
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/sign-in/social', headers: { origin: config.origin }, payload: { provider: 'github', callbackURL: 'x'.repeat(70000) } })).statusCode, 413);
  });
  await t.test('invalid callback state never creates an authenticated session', async () => {
    const invalid = await app.inject('/api/auth/callback/github?code=fake&state=untrusted');
    assert.ok(invalid.statusCode >= 300 && invalid.statusCode < 400);
    assert.ok(!cookieHeader(invalid.headers['set-cookie']).includes('session_token='));
  });

  let sessionCookie = '';
  let userId = '';
  await t.test('complete simulated provider flow sets a signed HttpOnly cookie and returns no tokens', async () => {
    const completed = await completeGitHub();
    assert.equal(completed.statusCode, 302, completed.body);
    const setCookies = completed.headers['set-cookie'];
    const cookies = Array.isArray(setCookies) ? setCookies : [setCookies ?? ''];
    const session = cookies.find(cookie => cookie.startsWith('codetogether.session_token='));
    assert.ok(session);
    assert.match(session, /HttpOnly/i); assert.match(session, /SameSite=Lax/i);
    sessionCookie = cookieHeader(cookies);
    const me = await app.inject({ url: '/api/me', headers: { cookie: sessionCookie } });
    assert.equal(me.statusCode, 200, me.body);
    assert.equal(me.json().user.email, email); assert.deepEqual(me.json().providers, ['github']);
    userId = me.json().user.id;
    assert.ok(!me.body.includes(fakeToken)); assert.ok(!me.body.includes('session_token'));
    const stored = await pool.query('SELECT "accessToken" FROM "account" WHERE "userId" = $1', [userId]);
    assert.notEqual(stored.rows[0].accessToken, fakeToken);
    assert.equal(await symmetricDecrypt({ key: config.secret, data: stored.rows[0].accessToken }), fakeToken);
  });
  await t.test('restarting the backend preserves the authenticated session', async () => {
    await app.close();
    ({ app, auth } = await createApp(config, pool, false));
    const me = await app.inject({ url: '/api/me', headers: { cookie: sessionCookie } });
    assert.equal(me.statusCode, 200); assert.equal(me.json().user.id, userId);
  });
  await t.test('identity assertions are discarded on both account creation and update', async () => {
    const context = await auth.$context;
    const account = await context.internalAdapter.createAccount({ userId, providerId: 'google', accountId: randomUUID(), idToken: 'test-only-identity-assertion' });
    assert.ok(account);
    try {
      const created = await pool.query('SELECT "idToken" FROM "account" WHERE id = $1', [account.id]);
      assert.equal(created.rows[0].idToken, null);
      await context.internalAdapter.updateAccount(account.id, { idToken: 'another-test-identity-assertion' });
      const updated = await pool.query('SELECT "idToken" FROM "account" WHERE id = $1', [account.id]);
      assert.equal(updated.rows[0].idToken, null);
    } finally { await pool.query('DELETE FROM "account" WHERE id = $1', [account.id]); }
  });
  await t.test('repeat login does not create duplicate users or provider accounts', async () => {
    const again = await completeGitHub();
    assert.equal(again.statusCode, 302);
    const users = await pool.query('SELECT count(*) FROM "user" WHERE email = $1', [email]);
    const accounts = await pool.query('SELECT count(*) FROM "account" WHERE "userId" = $1', [userId]);
    assert.equal(users.rows[0].count, '1'); assert.equal(accounts.rows[0].count, '1');
  });
  await t.test('a different identity with the same email is not implicitly linked', async () => {
    externalId = 'different-' + randomUUID();
    const other = await completeGitHub();
    assert.equal(other.statusCode, 302);
    assert.ok(String(other.headers.location).includes('account_not_linked'));
    const accounts = await pool.query('SELECT count(*) FROM "account" WHERE "userId" = $1', [userId]);
    assert.equal(accounts.rows[0].count, '1');
  });
  await t.test('expired and forged sessions are rejected', async () => {
    const token = randomUUID();
    await pool.query('INSERT INTO "session" (id, token, "userId", "expiresAt", "updatedAt") VALUES ($1, $2, $3, now() - interval \'1 minute\', now())', [randomUUID(), token, userId]);
    const value = encodeURIComponent(token + '.' + await makeSignature(token, config.secret));
    assert.equal((await app.inject({ url: '/api/me', headers: { cookie: 'codetogether.session_token=' + value } })).statusCode, 401);
    assert.equal((await app.inject({ url: '/api/me', headers: { cookie: 'codetogether.session_token=forged.invalid' } })).statusCode, 401);
  });
  await t.test('linking requires a recently authenticated verified account', async () => {
    const staleToken = randomUUID();
    await pool.query('INSERT INTO "session" (id, token, "userId", "expiresAt", "createdAt", "updatedAt") VALUES ($1, $2, $3, now() + interval \'1 day\', now() - interval \'11 minutes\', now())', [randomUUID(), staleToken, userId]);
    const staleCookie = 'codetogether.session_token=' + encodeURIComponent(staleToken + '.' + await makeSignature(staleToken, config.secret));
    const stale = await app.inject({ method: 'POST', url: '/api/auth/link-social', headers: { origin: config.origin, cookie: staleCookie }, payload: { provider: 'google' } });
    assert.equal(stale.statusCode, 403); assert.equal(stale.json().code, 'FRESH_SIGN_IN_REQUIRED');
    await pool.query('UPDATE "user" SET "emailVerified" = false WHERE id = $1', [userId]);
    const unverified = await app.inject({ method: 'POST', url: '/api/auth/link-social', headers: { origin: config.origin, cookie: sessionCookie }, payload: { provider: 'google' } });
    assert.equal(unverified.statusCode, 403);
    await pool.query('UPDATE "user" SET "emailVerified" = true WHERE id = $1', [userId]);
    const valid = await app.inject({ method: 'POST', url: '/api/auth/link-social', headers: { origin: config.origin, cookie: sessionCookie }, payload: { provider: 'google', callbackURL: config.origin + '/' } });
    assert.equal(valid.statusCode, 200, valid.body);
    const location = new URL(valid.json().url);
    assert.equal(location.hostname, 'accounts.google.com');
    assert.ok(location.searchParams.get('state'));
    assert.ok(location.searchParams.get('code_challenge'));
  });
  await t.test('logout revokes the database session and clears the cookie', async () => {
    const result = await app.inject({ method: 'POST', url: '/api/auth/sign-out', headers: { origin: config.origin, cookie: sessionCookie }, payload: {} });
    assert.equal(result.statusCode, 200);
    assert.match(String(result.headers['set-cookie']), /Max-Age=0/i);
    assert.equal((await app.inject({ url: '/api/me', headers: { cookie: sessionCookie } })).statusCode, 401);
  });
  await t.test('migration replay is safe and the schema retains its constraints', async () => {
    assert.deepEqual(await runMigrations(pool), []);
    const role = await pool.query('SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user');
    assert.deepEqual(role.rows[0], { rolsuper: false, rolcreatedb: false, rolcreaterole: false });
    const indexes = await pool.query('SELECT indexname FROM pg_indexes WHERE indexname = $1', ['account_provider_identity_unique']);
    assert.equal(indexes.rows.length, 1);
    assert.equal(auth.options.account?.accountLinking?.disableImplicitLinking, true);
  });
  await t.test('database outages return unavailable without leaking connection details', async () => {
    const unavailableUrl = new URL(config.databaseUrl); unavailableUrl.port = '1';
    const unavailablePool = createPool(unavailableUrl.toString());
    const { app: unavailable } = await createApp({ ...config, databaseUrl: unavailableUrl.toString() }, unavailablePool, false);
    try {
      assert.equal((await unavailable.inject('/api/health')).statusCode, 200);
      const readiness = await unavailable.inject('/api/ready');
      assert.equal(readiness.statusCode, 503);
      const profile = await unavailable.inject({ url: '/api/me', headers: { cookie: sessionCookie } });
      assert.equal(profile.statusCode, 503);
      assert.ok(!profile.body.includes(config.secret));
      assert.ok(!profile.body.includes(new URL(config.databaseUrl).password));
    } finally { await unavailable.close(); await unavailablePool.end(); }
  });
});
