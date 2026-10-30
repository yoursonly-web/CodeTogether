import { readConfig } from '../config.js';
import { createPool } from './pool.js';
import { runMigrations } from './migrations.js';

const pool = createPool(readConfig(process.env).databaseUrl);
try {
  const applied = await runMigrations(pool);
  console.log(applied.length ? 'Applied migrations: ' + applied.join(', ') : 'Database schema is already up to date.');
} catch {
  console.error('Migration failed. Check database availability, permissions and migration checksums. No database was reset.');
  process.exitCode = 1;
} finally { await pool.end(); }
