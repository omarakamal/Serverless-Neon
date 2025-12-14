import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: numeric('price').notNull(),
  description: text('description').default(''),
  imageUrl: text('image_url').default(''),
  // createdAt: timestamp('created_at').defaultNow(),
  // updatedAt: timestamp('updated_at').defaultNow(),
});
