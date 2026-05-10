CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`email` varchar(255),
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`object_key` varchar(512) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`content_type` varchar(127) NOT NULL,
	`size_bytes` bigint NOT NULL,
	`status` enum('pending','ready') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `uploads_user_id_idx` ON `uploads` (`user_id`);