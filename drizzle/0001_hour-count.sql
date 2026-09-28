ALTER TABLE `polls` ADD `hour_count` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `polls` SET `hour_count` = `last_hour` - `first_hour`;--> statement-breakpoint
ALTER TABLE `polls` DROP COLUMN `last_hour`;
