/*
  Warnings:

  - You are about to drop the column `enrolled_at` on the `enrollments` table. All the data in the column will be lost.
  - Added the required column `phone` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `enrollments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `courses` ADD COLUMN `is_paid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `payment_qr_image_path` VARCHAR(191) NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `enrollments` DROP COLUMN `enrolled_at`,
    ADD COLUMN `payment_proof_image_path` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `reviewed_at` DATETIME(3) NULL,
    ADD COLUMN `reviewed_by` INTEGER NULL,
    ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
