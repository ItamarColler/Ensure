import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { config } from '../config';

export const pool = new Pool({ connectionString: config.databaseUrl });

export const db = drizzle(pool);

export type DbExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];
