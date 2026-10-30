export interface Config {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  origin: string;
  databaseUrl: string;
  secret: string;
  google?: { clientId: string; clientSecret: string };
  github?: { clientId: string; clientSecret: string };
}

export function readConfig(env: NodeJS.ProcessEnv): Config {
  const nodeEnv = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV must be development, test or production.');
  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port.');
  let origin: URL;
  try { origin = new URL(env.BETTER_AUTH_URL ?? 'http://127.0.0.1:5173'); }
  catch { throw new Error('BETTER_AUTH_URL must be an absolute application URL.'); }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('BETTER_AUTH_URL must contain only the application origin.');
  }
  if (origin.protocol !== 'https:' && (nodeEnv === 'production' || !['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname))) {
    throw new Error('HTTPS is required outside local development.');
  }
  const databaseUrl = env.DATABASE_URL ?? '';
  try {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname || parsed.pathname.length < 2) throw new Error();
  } catch { throw new Error('DATABASE_URL must be a valid PostgreSQL connection string.'); }
  const secret = env.BETTER_AUTH_SECRET ?? '';
  if (secret.length < 32 || /replace|example|change.me/i.test(secret)) throw new Error('BETTER_AUTH_SECRET must be a generated secret of at least 32 characters.');
  const provider = (name: 'GOOGLE' | 'GITHUB') => {
    const clientId = env[name + '_CLIENT_ID']?.trim();
    const clientSecret = env[name + '_CLIENT_SECRET']?.trim();
    if (Boolean(clientId) !== Boolean(clientSecret)) throw new Error(name + ' requires both CLIENT_ID and CLIENT_SECRET.');
    return clientId && clientSecret ? { clientId, clientSecret } : undefined;
  };
  const google = provider('GOOGLE');
  const github = provider('GITHUB');
  if (nodeEnv === 'production' && (!google || !github)) throw new Error('Both OAuth providers must be configured in production.');
  return { nodeEnv: nodeEnv as Config['nodeEnv'], port, origin: origin.origin, databaseUrl, secret, google, github };
}
