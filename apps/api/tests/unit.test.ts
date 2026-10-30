import test from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../src/config.js';
import { publicUser } from '../src/auth.js';
import { safeRequestLog } from '../src/app.js';

const base = { NODE_ENV: 'test', DATABASE_URL: 'postgresql://user:private-password@127.0.0.1/test', BETTER_AUTH_SECRET: 'a-secure-generated-test-secret-with-enough-entropy' };

test('local configuration has a canonical origin and disabled missing providers', () => {
  const config = readConfig(base);
  assert.equal(config.origin, 'http://127.0.0.1:5173');
  assert.equal(config.port, 3001);
  assert.equal(config.google, undefined);
  assert.equal(config.github, undefined);
});

test('configuration rejects invalid origins, ports, secrets and partial providers', () => {
  for (const patch of [
    { BETTER_AUTH_URL: 'http://untrusted.example' },
    { BETTER_AUTH_URL: 'https://app.example/subpath' },
    { BETTER_AUTH_URL: 'https://user:password@app.example' },
    { PORT: 'not-a-port' }, { DATABASE_URL: 'private-password' },
    { BETTER_AUTH_SECRET: 'short' }, { GOOGLE_CLIENT_ID: 'id-only' },
  ]) assert.throws(() => readConfig({ ...base, ...patch }));
});

test('production requires HTTPS and both complete providers', () => {
  assert.throws(() => readConfig({ ...base, NODE_ENV: 'production' }));
  assert.throws(() => readConfig({ ...base, NODE_ENV: 'production', BETTER_AUTH_URL: 'https://app.example' }));
  const config = readConfig({ ...base, NODE_ENV: 'production', BETTER_AUTH_URL: 'https://app.example', GOOGLE_CLIENT_ID: 'google', GOOGLE_CLIENT_SECRET: 'secret', GITHUB_CLIENT_ID: 'github', GITHUB_CLIENT_SECRET: 'secret' });
  assert.equal(config.origin, 'https://app.example');
});

test('invalid database configuration errors do not echo credentials', () => {
  assert.throws(() => readConfig({ ...base, DATABASE_URL: 'secret-do-not-print' }), error => error instanceof Error && !error.message.includes('secret-do-not-print'));
});

test('public user serialization excludes tokens and database-only fields', () => {
  const raw = { id: 'id', name: 'Name', email: 'person@example.test', emailVerified: true, token: 'secret', accessToken: 'secret' };
  assert.deepEqual(publicUser(raw), { id: 'id', name: 'Name', email: 'person@example.test', emailVerified: true, image: null });
});

test('request logs omit OAuth codes, state and all request headers', () => {
  const log = safeRequestLog({ id: 'req-1', method: 'GET', url: '/api/auth/callback/github?code=private-code&state=private-state' });
  assert.deepEqual(log, { requestId: 'req-1', method: 'GET', path: '/api/auth/callback/github' });
  assert.ok(!JSON.stringify(log).includes('private-'));
});
