import { Pool } from 'pg';
import { config } from './config.js';

if (!config.dbUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: config.dbUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});
