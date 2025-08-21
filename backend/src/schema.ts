import { integer, real, text, sqliteTable } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  resetToken: text('resetToken'),
  resetTokenExpiry: integer('resetTokenExpiry', { mode: 'timestamp' }),
});

export const roomTypes = sqliteTable('room_types', {
  id: integer('id').primaryKey(),
  type: text('type').notNull(),
  price: real('price').notNull(),
  quantity: integer('quantity').notNull(),
  description: text('description').notNull(),
  images: text('images').default('[]'),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  checkIn: integer('check_in', { mode: 'timestamp' }).notNull(),
  checkOut: integer('check_out', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('pending'),
  roomTypeId: integer('room_type_id').notNull().references(() => roomTypes.id),
  nights: integer('nights').notNull(),
  roomPrice: real('room_price').notNull(),
  totalPrice: real('total_price').notNull(),
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  userId: integer('user_id').notNull().references(() => users.id),
  roomTypeId: integer('room_type_id').notNull().references(() => roomTypes.id),
  isVisible: integer('is_visible', { mode: 'boolean' }).notNull().default(true),
});

export const dining = sqliteTable('dining', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  images: text('images').default('[]'),
});

export const meetingsAndEvents = sqliteTable('meetings_and_events', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  capacity: integer('capacity').notNull(),
  eventType: text('event_type').notNull(),
  images: text('images').default('[]'),
});