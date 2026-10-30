import Fastify, { type FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { fromNodeHeaders } from 'better-auth/node';
import type { Pool } from 'pg';
import { createAuth, publicUser } from './auth.js';
import type { Config } from './config.js';

export function safeRequestLog(request: { method: string; url: string; id: string }) {
  return { method: request.method, path: request.url.split('?')[0], requestId: request.id };
}

function authHeaders(request: FastifyRequest) {
  const headers = fromNodeHeaders(request.headers);
  // We are not deployed behind a trusted proxy yet. Never trust supplied IP/host forwarding headers.
  for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'forwarded', 'x-real-ip']) headers.delete(name);
  return headers;
}

export async function createApp(config: Config, pool: Pool, logging = true) {
  const app = Fastify({
    bodyLimit: 64 * 1024,
    requestTimeout: 15000,
    trustProxy: false,
    logger: logging ? {
      level: 'info',
      serializers: { req: safeRequestLog, err: () => ({ type: 'RequestError', message: 'Request failed; details suppressed to protect credentials.', stack: '' }) },
      redact: ['req.headers.cookie', 'req.headers.authorization', 'res.headers.set-cookie'],
    } : false,
  });
  const auth = createAuth(config, pool);
  await app.register(rateLimit, { max: 150, timeWindow: '1 minute' });
  app.addHook('onSend', async (_request, reply) => { reply.header('cache-control', 'no-store'); reply.header('x-content-type-options', 'nosniff'); });
  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 503;
    if (status >= 500) request.log.error({ requestId: request.id }, 'Request could not be completed.');
    return reply.code(status).send({ error: status >= 500 ? 'Service temporarily unavailable.' : 'Request could not be accepted.', code: status >= 500 ? 'SERVICE_UNAVAILABLE' : 'INVALID_REQUEST', requestId: request.id });
  });

  app.get('/api/health', async () => ({ status: 'ok', service: 'codetogether-api' }));
  app.get('/api/ready', async (_request, reply) => {
    try { await pool.query('SELECT 1'); return { status: 'ready', database: 'connected' }; }
    catch { return reply.code(503).send({ status: 'unavailable', database: 'unavailable' }); }
  });
  app.get('/api/auth/providers', async () => ({ google: Boolean(config.google), github: Boolean(config.github) }));

  app.get('/api/me', async (request, reply) => {
    const current = await auth.api.getSession({ headers: authHeaders(request), query: { disableCookieCache: true } });
    if (!current) return reply.code(401).send({ error: 'Sign in to access your account.', code: 'UNAUTHENTICATED' });
    const accounts = await pool.query<{ providerId: string }>('SELECT "providerId" FROM "account" WHERE "userId" = $1', [current.user.id]);
    return { user: publicUser(current.user), providers: accounts.rows.map(row => row.providerId).filter(id => id === 'google' || id === 'github'), expiresAt: current.session.expiresAt };
  });

  const authPaths = new Map([
    ['/sign-in/social', 'POST'], ['/link-social', 'POST'], ['/sign-out', 'POST'],
    ['/callback/google', 'GET'], ['/callback/github', 'GET'],
  ]);
  app.route({
    method: ['GET', 'POST'], url: '/api/auth/*',
    async handler(request, reply) {
      const pathname = new URL(request.url, config.origin).pathname.slice('/api/auth'.length);
      if (authPaths.get(pathname) !== request.method) return reply.code(404).send({ error: 'Endpoint not available.' });
      if (request.method === 'POST' && request.headers.origin !== config.origin) return reply.code(403).send({ error: 'Request origin is not allowed.', code: 'UNTRUSTED_ORIGIN' });
      if ((pathname === '/sign-in/social' || pathname === '/link-social') && request.body && typeof request.body === 'object' && 'idToken' in request.body) {
        return reply.code(400).send({ error: 'Start sign-in with the provider redirect flow.', code: 'REDIRECT_FLOW_REQUIRED' });
      }
      if (pathname === '/link-social') {
        const session = await auth.api.getSession({ headers: authHeaders(request) });
        if (!session) return reply.code(401).send({ error: 'Sign in before connecting another provider.' });
        if (!session.user.emailVerified) return reply.code(403).send({ error: 'A verified account email is required to connect another provider.' });
        if (Date.now() - new Date(session.session.createdAt).getTime() > 10 * 60 * 1000) return reply.code(403).send({ error: 'Sign out and sign in again before connecting another provider.', code: 'FRESH_SIGN_IN_REQUIRED' });
      }
      const upstream = await auth.handler(new Request(config.origin + request.url, {
        method: request.method, headers: authHeaders(request),
        ...(request.method === 'POST' ? { body: JSON.stringify(request.body ?? {}) } : {}),
      }));
      reply.code(upstream.status);
      for (const [key, value] of upstream.headers) if (key.toLowerCase() !== 'set-cookie') reply.header(key, value);
      const cookies = upstream.headers.getSetCookie();
      if (cookies.length) reply.header('set-cookie', cookies);
      return reply.send(await upstream.text());
    },
  });
  return { app, auth };
}
