-- CreateTable
CREATE TABLE `calendar_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('class', 'exam', 'holiday', 'other') NOT NULL DEFAULT 'other',
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `is_recurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence_frequency` ENUM('daily', 'weekly', 'monthly') NULL,
    `recurrence_end_date` DATETIME(3) NULL,
    `course_id` INTEGER NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_events_starts_at_ends_at_idx`(`starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
