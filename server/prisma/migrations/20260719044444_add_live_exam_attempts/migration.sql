-- CreateTable
CREATE TABLE `live_exam_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `live_exam_id` INTEGER NOT NULL,
    `status` ENUM('in_progress', 'submitted') NOT NULL DEFAULT 'in_progress',
    `score` DECIMAL(6, 2) NULL,
    `total_marks` DECIMAL(6, 2) NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submitted_at` DATETIME(3) NULL,

    UNIQUE INDEX `live_exam_attempts_user_id_live_exam_id_key`(`user_id`, `live_exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `live_exam_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `selected_option` ENUM('A', 'B', 'C', 'D') NULL,
    `marked_for_review` BOOLEAN NOT NULL DEFAULT false,
    `is_correct` BOOLEAN NULL,
    `marks_awarded` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `answered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `live_exam_answers_attempt_id_question_id_key`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `live_exam_attempts` ADD CONSTRAINT `live_exam_attempts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_exam_attempts` ADD CONSTRAINT `live_exam_attempts_live_exam_id_fkey` FOREIGN KEY (`live_exam_id`) REFERENCES `live_exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_exam_answers` ADD CONSTRAINT `live_exam_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `live_exam_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_exam_answers` ADD CONSTRAINT `live_exam_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
