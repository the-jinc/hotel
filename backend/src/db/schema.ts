import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  boolean,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", [
  "admin",
  "manager",
  "receptionist",
  "guest",
]);
export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "booked",
  "cleaning",
  "out_of_service",
]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: roleEnum("role").notNull().default("guest"),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Room Categories table
export const roomCategories = pgTable("room_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  maxOccupancy: integer("max_occupancy").notNull(),
  amenities: text("amenities"), // JSON string of amenities
  images: text("images"), // JSON string of image URLs
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomNumber: varchar("room_number", { length: 10 }).notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => roomCategories.id),
  status: roomStatusEnum("status").notNull().default("available"),
  floor: integer("floor").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    checkInDate: timestamp("check_in_date").notNull(),
    checkOutDate: timestamp("check_out_date").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: bookingStatusEnum("status").notNull().default("pending_payment"),
    guestCount: integer("guest_count").notNull(),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    checkInDateIdx: index("idx_bookings_check_in_date").on(table.checkInDate),
    checkOutDateIdx: index("idx_bookings_check_out_date").on(
      table.checkOutDate
    ),
    statusIdx: index("idx_bookings_status").on(table.status),
    userIdIdx: index("idx_bookings_user_id").on(table.userId),
    createdAtIdx: index("idx_bookings_created_at").on(table.createdAt),
  })
);

// Booking Rooms (many-to-many relationship)
export const bookingRooms = pgTable("booking_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => bookings.id),
  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id),
  nightlyRate: decimal("nightly_rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Payments table
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
    transactionId: varchar("transaction_id", { length: 100 }),
    status: varchar("status", { length: 20 }).notNull().default("completed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("idx_payments_booking_id").on(table.bookingId),
    statusIdx: index("idx_payments_status").on(table.status),
    createdAtIdx: index("idx_payments_created_at").on(table.createdAt),
  })
);

// Food Categories table
export const foodCategories = pgTable("food_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Food Items table
export const foodItems = pgTable("food_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => foodCategories.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image", { length: 500 }),
  isAvailable: boolean("is_available").notNull().default(true),
  preparationTime: integer("preparation_time"), // in minutes
  allergens: text("allergens"), // JSON string of allergens
  ingredients: text("ingredients"),
  isVegetarian: boolean("is_vegetarian").notNull().default(false),
  isVegan: boolean("is_vegan").notNull().default(false),
  isGlutenFree: boolean("is_gluten_free").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Food Orders table
export const foodOrders = pgTable(
  "food_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").notNull().default("placed"),
    specialInstructions: text("special_instructions"),
    roomNumber: varchar("room_number", { length: 10 }), // for room service
    estimatedDeliveryTime: timestamp("estimated_delivery_time"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_food_orders_user_id").on(table.userId),
    statusIdx: index("idx_food_orders_status").on(table.status),
    createdAtIdx: index("idx_food_orders_created_at").on(table.createdAt),
  })
);

// Food Order Items (many-to-many relationship)
export const foodOrderItems = pgTable(
  "food_order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => foodOrders.id),
    foodItemId: uuid("food_item_id")
      .notNull()
      .references(() => foodItems.id),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    specialInstructions: text("special_instructions"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    orderIdIdx: index("idx_food_order_items_order_id").on(table.orderId),
    foodItemIdIdx: index("idx_food_order_items_food_item_id").on(
      table.foodItemId
    ),
  })
);

// Audit Logs table
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    action: varchar("action", { length: 50 }).notNull(), // CREATE, UPDATE, DELETE
    tableName: varchar("table_name", { length: 100 }).notNull(),
    recordId: varchar("record_id", { length: 100 }), // ID of the affected record
    oldValues: text("old_values"), // JSON string of old values (for UPDATE/DELETE)
    newValues: text("new_values"), // JSON string of new values (for CREATE/UPDATE)
    ipAddress: varchar("ip_address", { length: 45 }), // Support IPv6
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_audit_logs_user_id").on(table.userId),
    actionIdx: index("idx_audit_logs_action").on(table.action),
    tableNameIdx: index("idx_audit_logs_table_name").on(table.tableName),
    createdAtIdx: index("idx_audit_logs_created_at").on(table.createdAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  foodOrders: many(foodOrders),
  auditLogs: many(auditLogs),
}));

export const roomCategoriesRelations = relations(
  roomCategories,
  ({ many }) => ({
    rooms: many(rooms),
  })
);

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  category: one(roomCategories, {
    fields: [rooms.categoryId],
    references: [roomCategories.id],
  }),
  bookingRooms: many(bookingRooms),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  bookingRooms: many(bookingRooms),
  payments: many(payments),
}));

export const bookingRoomsRelations = relations(bookingRooms, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingRooms.bookingId],
    references: [bookings.id],
  }),
  room: one(rooms, {
    fields: [bookingRooms.roomId],
    references: [rooms.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

export const foodCategoriesRelations = relations(
  foodCategories,
  ({ many }) => ({
    foodItems: many(foodItems),
  })
);

export const foodItemsRelations = relations(foodItems, ({ one, many }) => ({
  category: one(foodCategories, {
    fields: [foodItems.categoryId],
    references: [foodCategories.id],
  }),
  orderItems: many(foodOrderItems),
}));

export const foodOrdersRelations = relations(foodOrders, ({ one, many }) => ({
  user: one(users, {
    fields: [foodOrders.userId],
    references: [users.id],
  }),
  orderItems: many(foodOrderItems),
}));

export const foodOrderItemsRelations = relations(foodOrderItems, ({ one }) => ({
  order: one(foodOrders, {
    fields: [foodOrderItems.orderId],
    references: [foodOrders.id],
  }),
  foodItem: one(foodItems, {
    fields: [foodOrderItems.foodItemId],
    references: [foodItems.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RoomCategory = typeof roomCategories.$inferSelect;
export type NewRoomCategory = typeof roomCategories.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type FoodCategory = typeof foodCategories.$inferSelect;
export type NewFoodCategory = typeof foodCategories.$inferInsert;
export type FoodItem = typeof foodItems.$inferSelect;
export type NewFoodItem = typeof foodItems.$inferInsert;
export type FoodOrder = typeof foodOrders.$inferSelect;
export type NewFoodOrder = typeof foodOrders.$inferInsert;
export type FoodOrderItem = typeof foodOrderItems.$inferSelect;
export type NewFoodOrderItem = typeof foodOrderItems.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
