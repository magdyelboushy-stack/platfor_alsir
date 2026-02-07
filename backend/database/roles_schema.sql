-- =============================================
-- Teachers Table - Separate from Users
-- =============================================

USE bacaloria_db;

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'اسم المعلم',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'البريد الإلكتروني',
    phone VARCHAR(20) NOT NULL COMMENT 'رقم الهاتف',
    password VARCHAR(255) NOT NULL COMMENT 'كلمة المرور المشفرة',
    avatar VARCHAR(255) NULL COMMENT 'الصورة الشخصية',
    banner VARCHAR(255) NULL COMMENT 'صورة الغلاف',
    bio TEXT NULL COMMENT 'نبذة تعريفية عن المعلم',
    subject VARCHAR(100) NOT NULL COMMENT 'المادة الدراسية',
    grade_levels JSON NOT NULL COMMENT 'الصفوف الدراسية ["أول ثانوي", "ثاني ثانوي"]',
    education_stages JSON NULL COMMENT 'المراحل التعليمية ["primary", "prep", "secondary"]',
    status ENUM('pending', 'active', 'blocked') DEFAULT 'pending' COMMENT 'حالة الحساب',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_subject (subject),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins Table (Super Admins only)
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assistants Table (Linked to Teachers)
CREATE TABLE IF NOT EXISTS assistants (
    id VARCHAR(36) PRIMARY KEY,
    teacher_id VARCHAR(36) NOT NULL COMMENT 'المعلم المسؤول',
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) NULL,
    permissions JSON NULL COMMENT 'الصلاحيات ["courses:view", "students:view"]',
    status ENUM('pending', 'active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_teacher (teacher_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update courses table to reference teachers table
-- ALTER TABLE courses DROP FOREIGN KEY courses_ibfk_1;
-- ALTER TABLE courses ADD CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
