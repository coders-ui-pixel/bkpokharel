-- CreateTable
CREATE TABLE `flash_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapter_id` INTEGER NOT NULL,
    `front` TEXT NOT NULL,
    `back` TEXT NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `flash_cards_chapter_id_idx`(`chapter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flash_card_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `flash_card_id` INTEGER NOT NULL,
    `status` ENUM('new', 'known', 'difficult') NOT NULL DEFAULT 'new',
    `is_favorite` BOOLEAN NOT NULL DEFAULT false,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `last_reviewed_at` DATETIME(3) NULL,

    UNIQUE INDEX `flash_card_progress_user_id_flash_card_id_key`(`user_id`, `flash_card_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `flash_cards` ADD CONSTRAINT `flash_cards_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flash_card_progress` ADD CONSTRAINT `flash_card_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flash_card_progress` ADD CONSTRAINT `flash_card_progress_flash_card_id_fkey` FOREIGN KEY (`flash_card_id`) REFERENCES `flash_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
