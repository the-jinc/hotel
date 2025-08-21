CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`check_in` integer NOT NULL,
	`check_out` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`room_type_id` integer NOT NULL,
	`nights` integer NOT NULL,
	`room_price` real NOT NULL,
	`total_price` real NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dining` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`images` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE `meetings_and_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`capacity` integer NOT NULL,
	`event_type` text NOT NULL,
	`images` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY NOT NULL,
	`rating` integer NOT NULL,
	`comment` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`user_id` integer NOT NULL,
	`room_type_id` integer NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_type_id`) REFERENCES `room_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_types` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`quantity` integer NOT NULL,
	`description` text NOT NULL,
	`images` text DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`resetToken` text,
	`resetTokenExpiry` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);