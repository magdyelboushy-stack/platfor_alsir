-- =============================================
-- Exam System Schema
-- Secure teacher-owned exam system with anti-cheating
-- =============================================

USE bacaloria_db;

-- 1. Exams Table (owned by teacher)
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NULL,
    section_id VARCHAR(36) NULL,
    teacher_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL DEFAULT 30,
    pass_score INT DEFAULT 50,
    max_attempts INT DEFAULT 1,
    is_randomized TINYINT(1) DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    show_results TINYINT(1) DEFAULT 1,
    anti_cheat_enabled TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    scheduled_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_status (status),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS exam_questions (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    type ENUM('single', 'multiple', 'true_false', 'essay') DEFAULT 'single',
    text TEXT NOT NULL,
    image_url TEXT NULL,
    points INT DEFAULT 1,
    sort_order INT DEFAULT 0,
    explanation TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exam (exam_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Answer Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id VARCHAR(36) PRIMARY KEY,
    question_id VARCHAR(36) NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    wrong_explanation TEXT NULL,
    sort_order INT DEFAULT 0,
    INDEX idx_question (question_id),
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Exam Attempts (prevent retakes - one attempt per student per exam)
CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    score INT DEFAULT 0,
    total_points INT DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    passed TINYINT(1) DEFAULT 0,
    status ENUM('in_progress', 'submitted', 'timed_out', 'voided') DEFAULT 'in_progress',
    anti_cheat_violations INT DEFAULT 0,
    UNIQUE KEY one_attempt_per_student (exam_id, user_id),
    INDEX idx_exam (exam_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Student Answers
CREATE TABLE IF NOT EXISTS exam_answers (
    id VARCHAR(36) PRIMARY KEY,
    attempt_id VARCHAR(36) NOT NULL,
    question_id VARCHAR(36) NOT NULL,
    selected_option_ids TEXT NULL,
    essay_answer TEXT NULL,
    is_correct TINYINT(1) NULL,
    points_earned INT DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attempt (attempt_id),
    INDEX idx_question (question_id),
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Anti-Cheat Violations Log
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
    id VARCHAR(36) PRIMARY KEY,
    attempt_id VARCHAR(36) NOT NULL,
    event_type ENUM('tab_switch', 'copy_paste', 'right_click', 'fullscreen_exit', 'devtools', 'screenshot') NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON NULL,
    INDEX idx_attempt (attempt_id),
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
