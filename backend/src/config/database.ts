import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../utils/logger';

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB || 'maindb',
  user: process.env.POSTGRES_USER || 'author_clock_user',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Set search path to author_clock schema
pool.on('connect', async (client: PoolClient) => {
  try {
    await client.query(`SET search_path TO ${process.env.POSTGRES_SCHEMA || 'author_clock'}, public`);
  } catch (err) {
    logger.error('Error setting search path:', err);
  }
});

// Pool error handler
pool.on('error', (err: Error) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Query the database
 * @param text SQL query string
 * @param params Query parameters
 * @returns Query result
 */
export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns Pool client
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Test database connection
 * @returns True if connection successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as now, current_schema() as schema');
    logger.info('Database connection successful', {
      time: result.rows[0].now,
      schema: result.rows[0].schema,
    });
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
}

/**
 * Close all connections in the pool
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', error);
    throw error;
  }
}

export default pool;
