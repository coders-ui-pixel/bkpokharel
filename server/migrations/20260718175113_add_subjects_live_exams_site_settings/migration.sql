/*
  Warnings:

  - You are about to drop the column `course_id` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `question_sets` table. All the data in the column will be lost.
  - You are about to drop the column `course_id` on the `questions` table. All the data in the column will be lost.
  - Added the required column `subject_id` to the `chapters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chapters` DROP FOREIGN KEY `chapters_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `question_sets` DROP FOREIGN KEY `question_sets_course_id_fkey`;

-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_course_id_fkey`;

-- DropIndex
DROP INDEX `chapters_course_id_order_index_idx` ON `chapters`;

-- AlterTable
ALTER TABLE `chapters` DROP COLUMN `course_id`,
    ADD COLUMN `subject_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `question_sets` DROP COLUMN `course_id`,
    ADD COLUMN `subject_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `questions` DROP COLUMN `course_id`,
    ADD COLUMN `subject_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `subjects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subjects_course_id_order_index_idx`(`course_id`, `order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `live_exams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `question_set_id` INTEGER NOT NULL,
    `course_id` INTEGER NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `status` ENUM('scheduled', 'live', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `live_exams_status_starts_at_idx`(`status`, `starts_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'MCQ Platform',
    `logo_image_path` VARCHAR(191) NULL,
    `favicon_image_path` VARCHAR(191) NULL,
    `theme_primary_color` VARCHAR(191) NOT NULL DEFAULT '#4f46e5',
    `theme_secondary_color` VARCHAR(191) NOT NULL DEFAULT '#22d3ee',
    `facebook_url` VARCHAR(191) NULL,
    `instagram_url` VARCHAR(191) NULL,
    `tiktok_url` VARCHAR(191) NULL,
    `youtube_url` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `chapters_subject_id_order_index_idx` ON `chapters`(`subject_id`, `order_index`);

-- CreateIndex
CREATE INDEX `question_sets_subject_id_idx` ON `question_sets`(`subject_id`);

-- CreateIndex
CREATE INDEX `questions_subject_id_idx` ON `questions`(`subject_id`);

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_sets` ADD CONSTRAINT `question_sets_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_exams` ADD CONSTRAINT `live_exams_question_set_id_fkey` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_exams` ADD CONSTRAINT `live_exams_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
