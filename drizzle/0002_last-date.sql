ALTER TABLE `polls` ADD `last_date` text NOT NULL DEFAULT '';--> statement-breakpoint
UPDATE `polls` SET `last_date` = (SELECT max(`value`) FROM json_each(`polls`.`dates`));--> statement-breakpoint
CREATE INDEX `polls_last_date` ON `polls` (`last_date`);
