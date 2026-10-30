import pg from 'pg';

export function createPool(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 10, connectionTimeoutMillis: 3000, idleTimeoutMillis: 30000, query_timeout: 5000, statement_timeout: 5000 });
  // Prevent an idle connection failure from becoming an unhandled process error.
  pool.on('error', () => { console.error('An idle database connection failed. New requests will retry the database.'); });
  return pool;
}
