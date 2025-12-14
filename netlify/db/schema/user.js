import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('admin'),
  // createdAt: timestamp('created_at').defaultNow(),
  // updatedAt: timestamp('updated_at').defaultNow(),
});
