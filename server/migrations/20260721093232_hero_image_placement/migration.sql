-- DropIndex
DROP INDEX `hero_images_is_enabled_order_index_idx` ON `hero_images`;

-- AlterTable
ALTER TABLE `hero_images` ADD COLUMN `placement` ENUM('public_home', 'dashboard') NOT NULL DEFAULT 'public_home';

-- CreateIndex
CREATE INDEX `hero_images_placement_is_enabled_order_index_idx` ON `hero_images`(`placement`, `is_enabled`, `order_index`);
