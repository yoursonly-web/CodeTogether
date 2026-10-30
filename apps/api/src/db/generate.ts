import { writeFile } from 'node:fs/promises';
import { getMigrations } from 'better-auth/db/migration';
import { createAuth } from '../auth.js';
import { readConfig } from '../config.js';
import { createPool } from './pool.js';

const config = readConfig(process.env);
const pool = createPool(config.databaseUrl);
try {
  const { options } = createAuth(config, pool);
  const migration = await getMigrations(options);
  const sql = await migration.compileMigrations();
  if (!sql.trim()) throw new Error('No schema changes to generate.');
  await writeFile(new URL('./migrations/001_auth.sql', import.meta.url), '-- Generated from Better Auth 1.7.14. Apply using the versioned migration runner.\n' + sql + '\n', { flag: 'wx' });
  console.log('Generated 001_auth.sql. Review it before applying. Existing migrations were not overwritten.');
} finally { await pool.end(); }
