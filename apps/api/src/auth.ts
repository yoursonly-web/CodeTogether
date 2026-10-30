import { betterAuth } from 'better-auth';
import type { Pool } from 'pg';
import type { Config } from './config.js';

export function createAuth(config: Config, pool: Pool) {
  return betterAuth({
    appName: 'CodeTogether',
    baseURL: config.origin,
    basePath: '/api/auth',
    secret: config.secret,
    database: pool,
    trustedOrigins: [config.origin],
    emailAndPassword: { enabled: false },
    socialProviders: {
      ...(config.google ? { google: { ...config.google, scope: ['openid', 'email', 'profile'] } } : {}),
      ...(config.github ? { github: { ...config.github, scope: ['read:user', 'user:email'] } } : {}),
    },
    user: { changeEmail: { enabled: false }, deleteUser: { enabled: false } },
    session: { expiresIn: 60 * 60 * 24 * 7, disableSessionRefresh: true, cookieCache: { enabled: false } },
    account: {
      encryptOAuthTokens: true,
      storeAccountCookie: false,
      storeStateStrategy: 'database',
      accountLinking: { enabled: true, disableImplicitLinking: true, allowDifferentEmails: false, allowUnlinkingAll: false, trustedProviders: [] },
    },
    // Identity assertions are needed only during the callback, never as durable credentials.
    databaseHooks: {
      account: {
        create: { before: async account => ({ data: { ...account, idToken: null } }) },
        update: { before: async account => ({ data: { ...account, idToken: null } }) },
      },
    },
    advanced: {
      cookiePrefix: 'codetogether',
      useSecureCookies: config.origin.startsWith('https:'),
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', path: '/' },
      ipAddress: { ipAddressHeaders: [], disableIpTracking: true },
      database: { generateId: 'uuid' },
    },
    rateLimit: { enabled: true, window: 60, max: 30, storage: 'memory' },
    onAPIError: { errorURL: config.origin + '/?auth_error=1', onError: () => {} },
    logger: { disabled: true },
    telemetry: { enabled: false },
  });
}

export type Auth = ReturnType<typeof createAuth>;

export function publicUser(user: { id: string; name: string; email: string; emailVerified: boolean; image?: string | null }) {
  return { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, image: user.image ?? null };
}
