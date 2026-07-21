-- DropForeignKey
ALTER TABLE `subjects` DROP FOREIGN KEY `subjects_course_id_fkey`;

-- AlterTable
ALTER TABLE `subjects` MODIFY `course_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `subjects` ADD CONSTRAINT `subjects_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
