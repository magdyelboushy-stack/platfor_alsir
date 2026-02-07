-- Weekly Evaluations Migration

CREATE TABLE IF NOT EXISTS `evaluations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `education_stage` ENUM('primary', 'prep', 'secondary') NOT NULL,
    `grade_level` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_grade` (`education_stage`, `grade_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `evaluation_files` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `evaluation_id` INT NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_type` ENUM('image', 'pdf') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_evaluation` FOREIGN KEY (`evaluation_id`) 
        REFERENCES `evaluations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
