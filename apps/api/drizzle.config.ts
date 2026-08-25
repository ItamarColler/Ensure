import { defineConfig } from 'drizzle-kit';

const connectionString =
  process.env['DATABASE_URL'] ??
  'postgres://ensure:ensure@localhost:5432/ensure';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './migrations',
  dbCredentials: { url: connectionString },
});
