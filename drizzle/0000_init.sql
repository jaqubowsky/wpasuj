CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`poll_id` text NOT NULL,
	`name` text NOT NULL,
	`normalised_name` text NOT NULL,
	`token_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_poll_name` ON `participants` (`poll_id`,`normalised_name`);--> statement-breakpoint
CREATE UNIQUE INDEX `participants_token_hash` ON `participants` (`token_hash`);--> statement-breakpoint
CREATE TABLE `polls` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`organiser_name` text NOT NULL,
	`dates` text NOT NULL,
	`first_hour` integer NOT NULL,
	`last_hour` integer NOT NULL,
	`time_zone` text NOT NULL,
	`organiser_token_hash` text NOT NULL,
	`final_date` text,
	`final_first_hour` integer,
	`final_last_hour` integer,
	`created_by_participant` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `slots` (
	`participant_id` integer NOT NULL,
	`date` text NOT NULL,
	`hour` integer NOT NULL,
	PRIMARY KEY(`participant_id`, `date`, `hour`),
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE cascade
);
