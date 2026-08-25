import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const healthEvents = pgTable('health_events', {
  id: serial('id').primaryKey(),
  checkedAt: timestamp('checked_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  ok: boolean('ok').notNull(),
  note: text('note'),
});
