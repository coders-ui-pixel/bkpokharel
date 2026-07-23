-- AlterTable
ALTER TABLE `users` ADD COLUMN `admin_role` ENUM('super_admin', 'admin', 'instructor', 'content_manager', 'moderator') NULL;
