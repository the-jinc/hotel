CREATE INDEX IF NOT EXISTS "idx_bookings_check_in_date" ON "bookings" USING btree ("check_in_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_check_out_date" ON "bookings" USING btree ("check_out_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_user_id" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bookings_created_at" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_food_order_items_order_id" ON "food_order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_food_order_items_food_item_id" ON "food_order_items" USING btree ("food_item_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_food_orders_user_id" ON "food_orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_food_orders_status" ON "food_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_food_orders_created_at" ON "food_orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_booking_id" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_created_at" ON "payments" USING btree ("created_at");