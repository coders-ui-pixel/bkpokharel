-- CreateTable
CREATE TABLE `hero_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_path` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hero_images_is_enabled_order_index_idx`(`is_enabled`, `order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
