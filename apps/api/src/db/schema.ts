import type { AddOn } from '@ensure/shared';
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  jsonb,
  numeric,
  pgSequence,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export interface CoverageOptions {
  addOns: AddOn[];
}

export const healthEvents = pgTable('health_events', {
  id: serial('id').primaryKey(),
  checkedAt: timestamp('checked_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  ok: boolean('ok').notNull(),
  note: text('note'),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  termsAccepted: boolean('terms_accepted').notNull(),
  marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    stage: smallint('stage').notNull().default(2),
    status: text('status').notNull().default('draft_authenticated'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      'applications_status_check',
      sql`${table.status} in ('draft_authenticated','pending_review')`,
    ),
  ],
);

export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .unique()
    .references(() => applications.id),
  licensePlate: text('license_plate').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  color: text('color').notNull(),
});

export const coverageSelections = pgTable('coverage_selections', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .unique()
    .references(() => applications.id),
  coverageType: text('coverage_type').notNull(),
  options: jsonb('options')
    .$type<CoverageOptions>()
    .notNull()
    .default({ addOns: [] }),
});

export const policyNumberSeq = pgSequence('policy_number_seq', {
  startWith: 100_000,
});

export const policyApplicants = pgTable('policy_applicants', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .unique()
    .references(() => applications.id),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  address: text('address').notNull(),
  nationalId: text('national_id').notNull(),
  phone: text('phone').notNull(),
  driversCount: integer('drivers_count').notNull(),
  familyStatus: text('family_status').notNull(),
});

export const policies = pgTable('policies', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .unique()
    .references(() => applications.id),
  policyNumber: text('policy_number')
    .notNull()
    .unique()
    .default(sql`'POL-' || nextval('policy_number_seq')`),
  premiumAmount: numeric('premium_amount', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }).notNull(),
  status: text('status').notNull().default('pending_review'),
  issuedAt: timestamp('issued_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
