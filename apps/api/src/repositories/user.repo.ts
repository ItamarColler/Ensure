import { eq } from 'drizzle-orm';

import type { DbExecutor } from '../db/pool';
import { db } from '../db/pool';
import type { UserRow } from '../db/rows';
import { users } from '../db/schema';

export interface NewUser {
  email: string;
  passwordHash: string;
  termsAccepted: boolean;
  marketingOptIn: boolean;
}

export async function findUserByEmail(
  email: string,
): Promise<UserRow | undefined> {
  const rows: UserRow[] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return rows[0];
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  const rows: UserRow[] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return rows[0];
}

export async function insertUser(
  tx: DbExecutor,
  value: NewUser,
): Promise<UserRow> {
  const inserted: UserRow[] = await tx.insert(users).values(value).returning();

  const created = inserted[0];

  if (!created) {
    throw new Error('user insert returned no row');
  }

  return created;
}
