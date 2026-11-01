CREATE TABLE `network_checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`node` text NOT NULL,
	`name` text NOT NULL,
	`people` integer NOT NULL,
	`location` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `network_checkins_node_created` ON `network_checkins` (`node`,`created_at`);--> statement-breakpoint
CREATE TABLE `network_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`node` text NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `network_messages_node_created` ON `network_messages` (`node`,`created_at`);--> statement-breakpoint
CREATE TABLE `network_operations` (
	`id` text PRIMARY KEY NOT NULL,
	`fingerprint` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `network_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`node` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`people` integer NOT NULL,
	`location` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `network_requests_node_created` ON `network_requests` (`node`,`created_at`);