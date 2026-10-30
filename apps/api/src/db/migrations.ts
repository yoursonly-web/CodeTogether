import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';

export async function runMigrations(pool: Pool, directory = new URL('./migrations/', import.meta.url)) {
  const files = (await readdir(directory)).filter(file => /^\d+_[a-z0-9_-]+\.sql$/i.test(file)).sort();
  if (!files.length) throw new Error('No versioned migrations found.');
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query('SELECT pg_advisory_lock(8230157)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const file of files) {
      const sql = (await readFile(fileURLToPath(new URL(file, directory)), 'utf8')).replace(/\r\n/g, '\n');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query<{ checksum: string }>('SELECT checksum FROM schema_migrations WHERE name = $1', [file]);
      if (existing.rows.length) {
        if (existing.rows[0].checksum !== checksum) throw new Error('An applied migration changed: ' + file);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [file, checksum]);
        await client.query('COMMIT');
        applied.push(file);
      } catch (error) { await client.query('ROLLBACK'); throw error; }
    }
    return applied;
  } finally { await client.query('SELECT pg_advisory_unlock(8230157)').catch(() => {}); client.release(); }
}
