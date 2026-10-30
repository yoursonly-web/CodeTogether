import { readConfig } from './config.js';
import { createPool } from './db/pool.js';
import { createApp } from './app.js';

async function main() {
  const config = readConfig(process.env);
  const pool = createPool(config.databaseUrl);
  const { app } = await createApp(config, pool);
  app.addHook('onClose', async () => { await pool.end(); });
  let closing = false;
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => {
    if (closing) return;
    closing = true;
    void app.close().catch(() => { process.exitCode = 1; });
  });
  await app.listen({ host: '127.0.0.1', port: config.port });
  app.log.info({ google: Boolean(config.google), github: Boolean(config.github) }, 'Authentication provider configuration');
}

main().catch(() => { console.error('API startup failed. Check local configuration, port availability and database setup. No secret values were logged.'); process.exitCode = 1; });
