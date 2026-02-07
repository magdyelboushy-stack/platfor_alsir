-- ================================================
-- هجرة: إزالة دور المعلم (Teacher Role Removal)
-- تاريخ: 2026-02-05
-- ================================================

-- ⚠️ IMPORTANT: قم بعمل نسخة احتياطية قبل تنفيذ هذا الملف!
-- mysqldump -u root bacaloria_db > backup_before_migration.sql

SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 1. حذف البيانات القديمة من الجداول المرتبطة
-- ================================================

-- حذف الـ sessions الخاصة بالمعلمين
DELETE FROM sessions WHERE user_id IN (SELECT id FROM teachers);

-- حذف الـ assistants (سنعيد إنشاءهم بدون teacher_id)
DELETE FROM assistants;

-- حذف teacher_files
DELETE FROM teacher_files;

-- ================================================
-- 2. تعديل جدول courses - إزالة teacher_id
-- ================================================

ALTER TABLE courses DROP FOREIGN KEY fk_course_teacher;
ALTER TABLE courses DROP COLUMN teacher_id;

-- ================================================
-- 3. تعديل جدول exams - إزالة teacher_id
-- ================================================

ALTER TABLE exams DROP FOREIGN KEY exams_teacher_id_fk;
ALTER TABLE exams DROP COLUMN teacher_id;

-- ================================================
-- 4. حذف جدول assistants وإعادة إنشائه بدون teacher_id
-- ================================================

DROP TABLE IF EXISTS assistants;

CREATE TABLE `assistants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL COMMENT 'الصلاحيات ["courses:view", "students:view"]',
  `status` enum('pending','active','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 5. حذف جدول teacher_files وإعادة تسميته لـ admin_files
-- ================================================

DROP TABLE IF EXISTS teacher_files;

CREATE TABLE `admin_files` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('local','cloudinary','external') COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `size` bigint DEFAULT '0',
  `downloads` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 6. حذف جدول teachers
-- ================================================

DROP TABLE IF EXISTS teachers;

-- ================================================
-- 7. تحديث ENUM في جدول users
-- ================================================

ALTER TABLE users 
  MODIFY COLUMN role ENUM('student','parent','admin','assistant','support') 
  COLLATE utf8mb4_unicode_ci DEFAULT 'student';

-- ================================================
-- 8. حذف دور teacher من جدول roles
-- ================================================

DELETE FROM roles WHERE name = 'teacher';

-- ================================================
-- 9. تحديث بيانات Admin (السير الشامي)
-- ================================================

UPDATE admins SET 
  name = 'السير الشامي',
  email = 'admin@bacaloria.com'
WHERE id = '1758b0426318f8e3f5baa69ac21df58f804d';

-- ================================================
-- 10. إعادة تفعيل FK checks
-- ================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- تم بنجاح! ✅
-- ================================================
