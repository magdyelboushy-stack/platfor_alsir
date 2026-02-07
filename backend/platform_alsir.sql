-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 07, 2026 at 06:08 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `platform_alsir`
--

DELIMITER $$

DROP PROCEDURE IF EXISTS `cleanup_old_data`$$

CREATE PROCEDURE `cleanup_old_data` ()
BEGIN
    DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY));
    DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < NOW();
    DELETE FROM two_factor_codes WHERE expires_at < NOW();
    UPDATE users SET verification_token = NULL WHERE verification_token IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND email_verified = 0;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activation_codes`
--

CREATE TABLE `activation_codes` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `batch_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redeemed_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redeemed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','used','expired','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activation_codes`
--

INSERT INTO `activation_codes` (`id`, `code`, `course_id`, `price`, `batch_name`, `generated_by`, `assigned_to`, `redeemed_by`, `redeemed_at`, `expires_at`, `status`, `created_at`) VALUES
('576aec25-fea9-4bbf-969b-a0cdc9626e27', '6D2MB8NSHV7Q', 'dc03298b-5832-4674-b881-207a477bf757', 500.00, NULL, NULL, NULL, NULL, '2026-02-06 20:31:27', NULL, 'used', '2026-02-06 20:31:23');

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone`, `password`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
('1758b0426318f8e3f5baa69ac21df58f804d', 'السير الشامي', 'admin@bacaloria.com', '01000000000', '$argon2id$v=19$m=65536,t=4,p=3$R2svMlNpdXZQd2FIdVh6TA$lD3W6DlxELdAyAHMJ7DG38rOwXe60WbQxMo/6ZYeU2k', NULL, 'active', '2026-02-01 16:24:44', '2026-02-06 08:15:37');

-- --------------------------------------------------------

--
-- Table structure for table `admin_files`
--

CREATE TABLE `admin_files` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('local','cloudinary','external') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `size` bigint DEFAULT '0',
  `downloads` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anti_cheat_logs`
--

CREATE TABLE `anti_cheat_logs` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` enum('tab_switch','copy_paste','right_click','fullscreen_exit','devtools','screenshot') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metadata` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assistants`
--

CREATE TABLE `assistants` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL COMMENT 'الصلاحيات ["courses:view", "students:view"]',
  `status` enum('pending','active','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'create, update, delete, login, logout, etc.',
  `table_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `created_at`) VALUES
(500, '1582e8f7-847d-4480-9506-ac8f04ea6969', 'delete', 'users', '1582e8f7-847d-4480-9506-ac8f04ea6969', '{\"name\": \"مجدي محمد مجدي\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-06 19:24:18'),
(501, 'fb833015-00bd-4942-b790-aaca1d181a75', 'delete', 'users', 'fb833015-00bd-4942-b790-aaca1d181a75', '{\"name\": \"محمد مجدي\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-06 19:26:16'),
(502, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 19:27:41'),
(503, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', '6df78ea8-ee31-4716-b95e-c8c56ed2e662', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 19:28:30'),
(504, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 19:57:40'),
(505, '6df78ea8-ee31-4716-b95e-c8c56ed2e662', 'sms_verification_success', 'users', '6df78ea8-ee31-4716-b95e-c8c56ed2e662', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"guest\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 19:59:58'),
(506, '6df78ea8-ee31-4716-b95e-c8c56ed2e662', 'login', 'students', '6df78ea8-ee31-4716-b95e-c8c56ed2e662', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:00:11'),
(507, '1758b0426318f8e3f5baa69ac21df58f804d', 'create_course', 'courses', 'dc03298b-5832-4674-b881-207a477bf757', '\"1758b0426318f8e3f5baa69ac21df58f804d\"', '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:05:49'),
(508, '1758b0426318f8e3f5baa69ac21df58f804d', 'create_section', 'course_sections', '0862a4d6-e47d-4561-803b-0e1e4ef7c773', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:05:50'),
(509, '1758b0426318f8e3f5baa69ac21df58f804d', 'create_lesson', 'lessons', 'dcc674bb-6414-4c00-bbaa-3ddda4e7505f', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:06:01'),
(510, '1758b0426318f8e3f5baa69ac21df58f804d', 'create_lesson', 'lessons', '4254eaf3-af7e-4a43-b1b5-e5129442db89', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:06:09'),
(511, '1758b0426318f8e3f5baa69ac21df58f804d', 'update_course', 'courses', 'dc03298b-5832-4674-b881-207a477bf757', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:07:56'),
(512, '1758b0426318f8e3f5baa69ac21df58f804d', 'update_course', 'courses', 'dc03298b-5832-4674-b881-207a477bf757', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:08:07'),
(513, '1758b0426318f8e3f5baa69ac21df58f804d', 'update_course', 'courses', 'dc03298b-5832-4674-b881-207a477bf757', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:10:53'),
(514, '1758b0426318f8e3f5baa69ac21df58f804d', 'update_course', 'courses', 'dc03298b-5832-4674-b881-207a477bf757', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:11:45'),
(515, '6df78ea8-ee31-4716-b95e-c8c56ed2e662', 'delete', 'users', '6df78ea8-ee31-4716-b95e-c8c56ed2e662', '{\"name\": \"مجدي محمد مجدي\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-06 20:13:08'),
(516, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', 'e0a8c7d7-e630-4f60-8616-d7e792935430', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:15:30'),
(517, 'e0a8c7d7-e630-4f60-8616-d7e792935430', 'sms_verification_success', 'users', 'e0a8c7d7-e630-4f60-8616-d7e792935430', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:15:43'),
(518, 'e0a8c7d7-e630-4f60-8616-d7e792935430', 'login', 'students', 'e0a8c7d7-e630-4f60-8616-d7e792935430', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:15:45'),
(519, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-06 20:31:12'),
(520, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-07 04:30:42'),
(521, 'e0a8c7d7-e630-4f60-8616-d7e792935430', 'delete', 'users', 'e0a8c7d7-e630-4f60-8616-d7e792935430', '{\"name\": \"مجدي محمد\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-07 04:59:19'),
(522, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', '87cd1837-eb76-46fe-afc6-95022650dbf0', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-07 05:01:32'),
(523, '87cd1837-eb76-46fe-afc6-95022650dbf0', 'sms_verification_success', 'users', '87cd1837-eb76-46fe-afc6-95022650dbf0', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"guest\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-07 05:01:56'),
(524, '87cd1837-eb76-46fe-afc6-95022650dbf0', 'login', 'students', '87cd1837-eb76-46fe-afc6-95022650dbf0', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-07 05:01:58');

-- --------------------------------------------------------

--
-- Table structure for table `backups`
--

CREATE TABLE `backups` (
  `id` bigint UNSIGNED NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint NOT NULL,
  `type` enum('full','incremental','differential') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'full',
  `status` enum('pending','in_progress','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `encrypted` tinyint(1) DEFAULT '0',
  `created_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_ips`
--

CREATE TABLE `blocked_ips` (
  `id` bigint UNSIGNED NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `blocked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `blocked_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(150) DEFAULT NULL,
  `admin_reply` text,
  `replied_at` timestamp NULL DEFAULT NULL,
  `telegram_message_id` varchar(30) DEFAULT NULL,
  `telegram_chat_id` varchar(30) DEFAULT NULL,
  `pending_reply_chat_id` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `phone`, `message`, `status`, `created_at`, `email`, `admin_reply`, `replied_at`, `telegram_message_id`, `telegram_chat_id`, `pending_reply_chat_id`) VALUES
('02d211ee-a626-4c7e-ad7d-7b9dd10f5d77', '????? ????', '01234567890', '?????? ??? ????? ???? ?????? ??? Cairo.', 'sent', '2026-02-07 04:51:12', 'client@example.com', NULL, NULL, NULL, NULL, NULL),
('49c56b31-354c-4b12-8034-2dc055f9f02e', '????? ????', '01234567890', '?????? ?????? ?????? ???? ?????.', 'sent', '2026-02-07 04:45:31', 'client@example.com', NULL, NULL, NULL, NULL, NULL),
('64cbd20e-7b74-4cc2-966a-5e6adef2c6ca', 'شسي', '01156820932', 'magdymohamed1929@gmail.commagdymohamed1929@gmail.commagdymohamed1929@gmail.commagdymohamed1929@gmail.com', 'sent', '2026-02-07 04:58:15', 'magdymohamed1929@gmail.com', NULL, NULL, NULL, NULL, NULL),
('836f3234-33a6-4303-89e1-d31018e4b1d0', '???? ??????', '01234567890', '?????? ????? ??????. ??? ????? ???? ?????? ?????? ?? ???????.', 'sent', '2026-02-07 04:41:48', 'client@example.com', NULL, NULL, NULL, NULL, NULL),
('861cd96e-582a-4722-a274-6c38b68d5d5d', 'مجدي محمد', '01156820932', 'Website Presentation KitWebsite Presentation KitWebsite Presentation KitWebsite Presentation KitWebsite Presentation Kit', 'sent', '2026-02-07 04:53:27', 'magdymohamed1929@gmail.com', NULL, NULL, NULL, NULL, NULL),
('863faf58-bb92-4656-9337-fb3c63ff064a', '???? ??????', '01234567890', '??? ????? ?????? ???????.', 'sent', '2026-02-07 04:37:56', 'client@example.com', NULL, NULL, NULL, NULL, NULL),
('9366c2c1-396f-4dbd-8994-099040541e57', 'مجدي', '01156820932', 'asdasdasd asd qwueqiow asoidu oasudioqwe شسياسشعي ضصث', 'responded', '2026-02-07 04:39:13', 'magdymohamed1929@gmail.com', 'شسي', '2026-02-07 04:47:42', NULL, NULL, NULL),
('b193b354-937d-42fb-bf18-d978a5a3f07b', 'مجدي', '01156820932', 'شسيشسيشسي ضصثشسي ضصيضصي سيش', 'sent', '2026-02-07 04:28:58', NULL, NULL, NULL, NULL, NULL, NULL),
('bb48a76a-8957-4f5f-af31-036d0e3ed170', 'شسيشسي', '01156820932', 'asdasdadqewqweqweasd qw asd qwe ads', 'responded', '2026-02-07 04:42:56', 'magdymohamed1929@gmail.com', 'شسي', '2026-02-07 04:57:31', NULL, NULL, NULL),
('e4636854-9c92-41cf-85c3-499f09f94c2a', 'شسي', '01156820932', 'magdymohamed1929@gmail.commagdymohamed1929@gmail.commagdymohamed1929@gmail.commagdymohamed1929@gmail.com', 'responded', '2026-02-07 04:46:56', 'magdymohamed1929@gmail.com', 'asd', '2026-02-07 04:52:43', NULL, NULL, NULL),
('e53c24d0-c9d6-4926-8ec8-6591ce110148', 'سشي', '01156820932', 'magdymohamed1929@gmail.com', 'sent', '2026-02-07 05:09:54', 'magdymohamed1929@gmail.com', NULL, NULL, '5', '8265886951', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `objectives` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_video_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `education_stage` enum('primary','prep','secondary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `objectives`, `thumbnail`, `intro_video_url`, `price`, `education_stage`, `grade_level`, `subject`, `status`, `created_at`, `updated_at`) VALUES
('dc03298b-5832-4674-b881-207a477bf757', 'كورس التفاضل والتكامل 2026', 'التفاضل والتكامل لطلاب الاونلاين 2026', '[\"\\u0634\\u0631\\u062d \\u0645\\u0641\\u0635\\u0644\",\"\\u062d\\u0644 \\u062a\\u062f\\u0631\\u064a\\u0628\\u0627\\u062a\",\"\\u0633\\u0639\\u0631 \\u0645\\u062e\\u0641\\u0636\"]', '/api/files/thumbnails/course_thumb_e9149211d7e040fd5e58805312882b94.jpg', NULL, 500.00, 'secondary', '12', 'عام', 'published', '2026-02-06 20:05:49', '2026-02-06 20:17:51');

-- --------------------------------------------------------

--
-- Table structure for table `course_sections`
--

CREATE TABLE `course_sections` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_sections`
--

INSERT INTO `course_sections` (`id`, `course_id`, `title`, `sort_order`, `created_at`) VALUES
('0862a4d6-e47d-4561-803b-0e1e4ef7c773', 'dc03298b-5832-4674-b881-207a477bf757', 'مدخل التفاضل الجزء الأول و الثاني', 0, '2026-02-06 20:05:50');

-- --------------------------------------------------------

--
-- Table structure for table `email_verification_log`
--

CREATE TABLE `email_verification_log` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `progress_percent` int DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int NOT NULL DEFAULT '30',
  `pass_score` int DEFAULT '50',
  `max_attempts` int DEFAULT '1',
  `is_randomized` tinyint(1) DEFAULT '0',
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `show_results` tinyint(1) DEFAULT '1',
  `anti_cheat_enabled` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_answers`
--

CREATE TABLE `exam_answers` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `selected_option_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `essay_answer` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_earned` int DEFAULT '0',
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `time_spent_seconds` int DEFAULT '0',
  `score` int DEFAULT '0',
  `total_points` int DEFAULT '0',
  `percentage` decimal(5,2) DEFAULT '0.00',
  `passed` tinyint(1) DEFAULT '0',
  `status` enum('in_progress','submitted','timed_out','voided') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `anti_cheat_violations` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_questions`
--

CREATE TABLE `exam_questions` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('single','multiple','true_false','essay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'single',
  `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `points` int DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `failed_login_attempts`
-- (See below for the actual view)
--
CREATE TABLE `failed_login_attempts` (
`attempt_count` bigint
,`identifier` varchar(255)
,`ip_address` varchar(45)
,`last_attempt` timestamp
,`user_agent` text
);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content_type` enum('video','pdf','exam') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'video',
  `content_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT '0',
  `is_preview` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `section_id`, `title`, `description`, `content_type`, `content_url`, `duration_minutes`, `is_preview`, `sort_order`, `created_at`) VALUES
('4254eaf3-af7e-4a43-b1b5-e5129442db89', '0862a4d6-e47d-4561-803b-0e1e4ef7c773', 'مدخل التفاضل الجزء الثاني', NULL, 'video', '5b68b948f31535bc4e576a9925dadd98', 15, 0, 0, '2026-02-06 20:06:09'),
('dcc674bb-6414-4c00-bbaa-3ddda4e7505f', '0862a4d6-e47d-4561-803b-0e1e4ef7c773', 'مدخل التفاضل الجزء الثاني', NULL, 'video', '5b68b948f31535bc4e576a9925dadd98', 1, 0, 0, '2026-02-06 20:06:01');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `watched_seconds` int DEFAULT '0',
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int NOT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempts` int DEFAULT '1',
  `last_attempt_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `identifier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `success` tinyint(1) DEFAULT '0',
  `failure_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_history`
--

CREATE TABLE `password_history` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'users.view', 'View Users', '2026-01-24 08:57:49'),
(2, 'users.create', 'Create Users', '2026-01-24 08:57:49'),
(3, 'users.edit', 'Edit Users', '2026-01-24 08:57:49'),
(4, 'users.delete', 'Delete Users', '2026-01-24 08:57:49'),
(5, 'courses.view', 'View Courses', '2026-01-24 08:57:49'),
(6, 'courses.create', 'Create Courses', '2026-01-24 08:57:49'),
(7, 'courses.edit', 'Edit Courses', '2026-01-24 08:57:49'),
(8, 'courses.delete', 'Delete Courses', '2026-01-24 08:57:49'),
(9, 'reports.view', 'View Reports', '2026-01-24 08:57:49'),
(10, 'settings.manage', 'Manage Settings', '2026-01-24 08:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `question_options`
--

CREATE TABLE `question_options` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_correct` tinyint(1) DEFAULT '0',
  `wrong_explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Administrator - Full Access', '2026-01-24 08:57:49'),
(3, 'student', 'Student - Standard Access', '2026-01-24 08:57:49'),
(4, 'parent', 'Parent - View Access', '2026-01-24 08:57:49');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` int UNSIGNED NOT NULL,
  `permission_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`, `created_at`) VALUES
('0nble3rug1auglf86qoglui670', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQ0MjM3Nzs=', 1770442377, '2026-02-07 05:32:57'),
('4025t5k8jqfptparqtclq4mv3d', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4MjE5Ow==', 1770438219, '2026-02-07 04:23:39'),
('6jd06oonduuado1h5qe1ie1qun', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQwNzg3Nzs=', 1770407877, '2026-02-06 19:57:57'),
('7cb5bkk809he0pv4828hgfgsuv', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4MjU0Ow==', 1770438254, '2026-02-07 04:24:14'),
('8bbkg8rb1tqlr2c3cfdrcmlbd8', 'e0a8c7d7-e630-4f60-8616-d7e792935430', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQwODk0NTtjc3JmX3Rva2VufHM6NjQ6IjMxMDU2ZmExNjdkYjJhNjlkMDE1ZjNhYWQ3OTFjZTBiNGNjYzQxMDIwYjlhNzA3OTE0MzhmYjA2NzQ5MzY5ZDQiO3VzZXJfaWR8czozNjoiZTBhOGM3ZDctZTYzMC00ZjYwLTg2MTYtZDdlNzkyOTM1NDMwIjtyb2xlfHM6Nzoic3R1ZGVudCI7bG9naW5fdGltZXxpOjE3NzA0MDg5NDU7Z3JhZGVfbGV2ZWx8czoyOiIxMiI7ZWR1Y2F0aW9uX3N0YWdlfHM6OToic2Vjb25kYXJ5Ijs=', 1770410530, '2026-02-06 20:15:45'),
('926m5emk6c8vlgecs1tc66gbsc', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4MzE0Ow==', 1770438315, '2026-02-07 04:25:15'),
('ajk10d9m3r0ipdgatc4mlr3c5h', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4MjU0O2NzcmZfdG9rZW58czo2NDoiYzMyNjQ4Mzk4ZWY4OTVkM2U5OTQ5ODAyMzA5NmI5Y2E1YTBhYmEyMmE0NTEwNzE5ZTBkODY5NDlmYjc5NDU5ZiI7', 1770438254, '2026-02-07 04:24:14'),
('dfqk31ogem5gjn0p4vc6mnlvlh', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Trae/1.107.1 Chrome/142.0.7444.235 Electron/39.2.7 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTQ1OiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBUcmFlLzEuMTA3LjEgQ2hyb21lLzE0Mi4wLjc0NDQuMjM1IEVsZWN0cm9uLzM5LjIuNyBTYWZhcmkvNTM3LjM2IjtsYXN0X3JlZ2VuZXJhdGlvbnxpOjE3NzA0MzgzODc7', 1770438387, '2026-02-07 04:26:27'),
('e8clbrrh9ev6dilvd4jgi9anoi', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM5NTMxOw==', 1770439534, '2026-02-07 04:45:34'),
('j9vp3fmn11tu468gr5278elu3h', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQzOTEyODs=', 1770439128, '2026-02-07 04:38:48'),
('kks5lplejm8besoj8qr9krns45', '87cd1837-eb76-46fe-afc6-95022650dbf0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQ0MjM3Nztjc3JmX3Rva2VufHM6NjQ6ImQzZDBiYWJkMjk3NjFkZDllYTVhN2VkNGViZDM5ZWY5MWE0NTkxZWRkYzUyOGQ5MmE3NWNiNGJiZGQzZjMyMzQiO3VzZXJfaWR8czozNjoiODdjZDE4MzctZWI3Ni00NmZlLWFmYzYtOTUwMjI2NTBkYmYwIjtyb2xlfHM6Nzoic3R1ZGVudCI7bG9naW5fdGltZXxpOjE3NzA0NDA1MTg7Z3JhZGVfbGV2ZWx8czoyOiIxMiI7ZWR1Y2F0aW9uX3N0YWdlfHM6OToic2Vjb25kYXJ5Ijs=', 1770443377, '2026-02-07 05:32:57'),
('m4tbvb9buuin3ubp0hf9vqfr4d', '1758b0426318f8e3f5baa69ac21df58f804d', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQ0MjM3Nztjc3JmX3Rva2VufHM6NjQ6Ijc2YTMyNzNkODU5OTcyY2FmNDBiOTFmZThkNzVmODY3ZWM3OGRkOTkwMjFmNjJmMGYwNjNlZWYwZmU1MmVmZTMiO3VzZXJfaWR8czozNjoiMTc1OGIwNDI2MzE4ZjhlM2Y1YmFhNjlhYzIxZGY1OGY4MDRkIjtyb2xlfHM6NToiYWRtaW4iO2xvZ2luX3RpbWV8aToxNzcwNDM4NjQyOw==', 1770443377, '2026-02-07 05:32:57'),
('n96bpq132vbk5v5ujl98srl8ia', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM5MDc2Ow==', 1770439078, '2026-02-07 04:37:58'),
('nni2jmcjikc6b880j7js7iili1', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQ0MjM3Nzs=', 1770442377, '2026-02-07 05:32:57'),
('ockdb8loghns3dvj82kmuc664q', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4ODMzOw==', 1770438833, '2026-02-07 04:33:53'),
('pkg73ei7diuq9qb7mbl6akmu9r', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM4MjE5O2NzcmZfdG9rZW58czo2NDoiYmIxNTY3MzA0MTA0ZGE1MWY1ZTU1MWFmZjRmN2M3OWVkYjhkZjU1MTJiNjMzMDYwNjMyYzBlMTk3YTY1YzgyYyI7', 1770438219, '2026-02-07 04:23:39'),
('qu5jrgm2r7lntu9366u1n7bppe', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM5ODcyOw==', 1770439875, '2026-02-07 04:51:15'),
('s5lef7a3embtp09jd4q8b0kpk0', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQwOTY3Mjs=', 1770409673, '2026-02-06 20:27:52'),
('t2fuml6rrnkvrqq66tjcoh0nsp', NULL, '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7019', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6ODE6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UOyBXaW5kb3dzIE5UIDEwLjA7IGVuLVVTKSBXaW5kb3dzUG93ZXJTaGVsbC81LjEuMjYxMDAuNzAxOSI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwNDM5MzA4Ow==', 1770439310, '2026-02-07 04:41:50'),
('ucicbftktmm53h38v7n53iddg4', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQ0MDQ4Mjs=', 1770440482, '2026-02-07 05:01:22'),
('vapjuljt3p1vekse0ibqprnrag', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDQzNzc1NTs=', 1770437755, '2026-02-07 04:15:55');

-- --------------------------------------------------------

--
-- Table structure for table `suspicious_activities`
--

CREATE TABLE `suspicious_activities` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sql_injection, xss_attempt, rate_limit, etc.',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `request_uri` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `request_data` json DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high','critical') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `handled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`key`, `value`, `updated_at`) VALUES
('address', 'القاهرة، مصر', '2026-02-03 13:56:01'),
('contact_email', 'contact@alshamy.com', '2026-02-06 17:03:18'),
('contact_phone', '01156820932', '2026-02-03 13:56:38'),
('facebook_group', '#https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('facebook_url', 'https://www.facebook.com/alshamy', '2026-02-06 17:03:18'),
('instagram_url', 'https://www.facebook.com/p/%D9%85%D8%AD%D9%85%D8%AF-%D8%A7%D9%84%D9%86%D8%B6%D8%A7%D8%B1-Mr-mohamed-elnadar-100090610424563/', '2026-02-03 13:57:06'),
('telegram_group', 'https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('telegram_url', 'https://t.me/Bastnhalk', '2026-02-03 14:50:00'),
('tiktok_url', 'https://www.tiktok.com/@bastnhalk?_t=8pDlwYV6ZKk&_r=1', '2026-02-03 14:50:00'),
('whatsapp_group', 'https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('whatsapp_number', '+201156820932', '2026-02-03 13:56:57'),
('youtube_url', 'https://www.youtube.com/@alshamy', '2026-02-06 17:03:18');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit','withdrawal','purchase','activation') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trusted_devices`
--

CREATE TABLE `trusted_devices` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_factor_codes`
--

CREATE TABLE `two_factor_codes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('login','password_reset','email_change') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'login',
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `unhandled_suspicious_activities`
-- (See below for the actual view)
--
CREATE TABLE `unhandled_suspicious_activities` (
`activity_type` varchar(50)
,`created_at` timestamp
,`description` text
,`id` bigint unsigned
,`ip_address` varchar(45)
,`severity` enum('low','medium','high','critical')
,`user_id` varchar(36)
);

-- --------------------------------------------------------

--
-- Table structure for table `uploaded_files`
--

CREATE TABLE `uploaded_files` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','parent','admin','assistant','support') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `permissions` json DEFAULT NULL,
  `teacher_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade_level` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `governorate` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_stage` enum('primary','prep','secondary') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','ذكر','أنثى') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','active','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `last_failed_login` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_secret` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_locked_until` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete',
  `sms_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_sms_verified` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `permissions`, `teacher_id`, `parent_phone`, `school_name`, `grade_level`, `governorate`, `city`, `education_stage`, `birth_date`, `gender`, `guardian_name`, `avatar`, `bio`, `status`, `last_session_id`, `created_at`, `updated_at`, `email_verified`, `verification_token`, `password_reset_token`, `password_reset_expires`, `failed_login_attempts`, `last_failed_login`, `last_login`, `ip_address`, `user_agent`, `two_factor_enabled`, `two_factor_secret`, `account_locked_until`, `deleted_at`, `sms_code`, `is_sms_verified`) VALUES
('87cd1837-eb76-46fe-afc6-95022650dbf0', 'مجدي محمد مجدي', 'magdymohamed1929@gmail.com', '$argon2id$v=19$m=65536,t=4,p=3$OUxnTHVCV0dMdkhmRXQ1Rw$T5BAbfzvwL5x8UOwvgXupRdovjrfFo/m/zvTF+ss32c', '01156820932', 'student', NULL, NULL, '01228585932', NULL, '12', 'الجيزة', 'الحوامدية', 'secondary', '2010-04-05', 'male', 'محمد مجدي', 'avatars/avatar_3c88ada342946feb29ba0d5a173c6892.jpg', NULL, 'active', NULL, '2026-02-07 05:00:57', '2026-02-07 05:01:56', 0, '0820fc099fe4c7a6c9f77eae2732ce7c97c924ec7f679da0be009b357a636677', NULL, NULL, 0, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, NULL, NULL, NULL, NULL, 1);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `log_user_deletion` BEFORE DELETE ON `users` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, ip_address, user_agent)
    VALUES (OLD.id, 'delete', 'users', OLD.id, 
            JSON_OBJECT('name', OLD.name, 'email', OLD.email),
            @current_ip, @current_user_agent);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `save_password_history` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    IF OLD.password != NEW.password THEN
        INSERT INTO password_history (user_id, password_hash)
        VALUES (NEW.id, OLD.password);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activation_codes`
--
ALTER TABLE `activation_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `assigned_to` (`assigned_to`),
  ADD KEY `redeemed_by` (`redeemed_by`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activity_logs_user` (`user_id`),
  ADD KEY `idx_activity_logs_type` (`action_type`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `admin_files`
--
ALTER TABLE `admin_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `anti_cheat_logs`
--
ALTER TABLE `anti_cheat_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attempt` (`attempt_id`);

--
-- Indexes for table `assistants`
--
ALTER TABLE `assistants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_table_name` (`table_name`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `backups`
--
ALTER TABLE `backups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `blocked_ips`
--
ALTER TABLE `blocked_ips`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ip_address` (`ip_address`),
  ADD KEY `idx_ip_address` (`ip_address`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `blocked_by` (`blocked_by`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stage_grade` (`education_stage`,`grade_level`);

--
-- Indexes for table `course_sections`
--
ALTER TABLE `course_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `email_verification_log`
--
ALTER TABLE `email_verification_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `code_id` (`code_id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course` (`course_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attempt` (`attempt_id`),
  ADD KEY `idx_question` (`question_id`);

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `one_attempt_per_student` (`exam_id`,`user_id`),
  ADD KEY `idx_exam` (`exam_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam` (`exam_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_progress` (`user_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_attempts_ip` (`ip_address`);

--
-- Indexes for table `password_history`
--
ALTER TABLE `password_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `question_options`
--
ALTER TABLE `question_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_question` (`question_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_last_activity` (`last_activity`);

--
-- Indexes for table `suspicious_activities`
--
ALTER TABLE `suspicious_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_ip_address` (`ip_address`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_handled` (`handled`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_device_id` (`device_id`);

--
-- Indexes for table `two_factor_codes`
--
ALTER TABLE `two_factor_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `uploaded_files`
--
ALTER TABLE `uploaded_files`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_email_verified` (`email_verified`),
  ADD KEY `idx_verification_token` (`verification_token`),
  ADD KEY `idx_password_reset_token` (`password_reset_token`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=525;

--
-- AUTO_INCREMENT for table `backups`
--
ALTER TABLE `backups`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `blocked_ips`
--
ALTER TABLE `blocked_ips`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_verification_log`
--
ALTER TABLE `email_verification_log`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `password_history`
--
ALTER TABLE `password_history`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `suspicious_activities`
--
ALTER TABLE `suspicious_activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `two_factor_codes`
--
ALTER TABLE `two_factor_codes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `failed_login_attempts`
--
DROP TABLE IF EXISTS `failed_login_attempts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `failed_login_attempts`  AS SELECT `login_attempts`.`identifier` AS `identifier`, `login_attempts`.`ip_address` AS `ip_address`, count(0) AS `attempt_count`, max(`login_attempts`.`created_at`) AS `last_attempt`, `login_attempts`.`user_agent` AS `user_agent` FROM `login_attempts` WHERE ((`login_attempts`.`success` = 0) AND (`login_attempts`.`created_at` > (now() - interval 24 hour))) GROUP BY `login_attempts`.`identifier`, `login_attempts`.`ip_address` HAVING (`attempt_count` >= 3) ORDER BY `attempt_count` DESC ;

-- --------------------------------------------------------

--
-- Structure for view `unhandled_suspicious_activities`
--
DROP TABLE IF EXISTS `unhandled_suspicious_activities`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `unhandled_suspicious_activities`  AS SELECT `suspicious_activities`.`id` AS `id`, `suspicious_activities`.`user_id` AS `user_id`, `suspicious_activities`.`ip_address` AS `ip_address`, `suspicious_activities`.`activity_type` AS `activity_type`, `suspicious_activities`.`severity` AS `severity`, `suspicious_activities`.`created_at` AS `created_at`, `suspicious_activities`.`description` AS `description` FROM `suspicious_activities` WHERE (`suspicious_activities`.`handled` = 0) ORDER BY field(`suspicious_activities`.`severity`,'critical','high','medium','low') ASC, `suspicious_activities`.`created_at` DESC ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activation_codes`
--
ALTER TABLE `activation_codes`
  ADD CONSTRAINT `activation_codes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activation_codes_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `activation_codes_ibfk_4` FOREIGN KEY (`redeemed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `anti_cheat_logs`
--
ALTER TABLE `anti_cheat_logs`
  ADD CONSTRAINT `anti_cheat_logs_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `backups`
--
ALTER TABLE `backups`
  ADD CONSTRAINT `backups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blocked_ips`
--
ALTER TABLE `blocked_ips`
  ADD CONSTRAINT `blocked_ips_ibfk_1` FOREIGN KEY (`blocked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `course_sections`
--
ALTER TABLE `course_sections`
  ADD CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_verification_log`
--
ALTER TABLE `email_verification_log`
  ADD CONSTRAINT `email_verification_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`code_id`) REFERENCES `activation_codes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_attempts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD CONSTRAINT `exam_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_history`
--
ALTER TABLE `password_history`
  ADD CONSTRAINT `password_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_options`
--
ALTER TABLE `question_options`
  ADD CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `suspicious_activities`
--
ALTER TABLE `suspicious_activities`
  ADD CONSTRAINT `suspicious_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  ADD CONSTRAINT `trusted_devices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `two_factor_codes`
--
ALTER TABLE `two_factor_codes`
  ADD CONSTRAINT `two_factor_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

DELIMITER $$
--
-- Events
--
DROP EVENT IF EXISTS `daily_cleanup`;
CREATE EVENT `daily_cleanup` ON SCHEDULE EVERY 1 DAY STARTS '2026-01-24 10:59:36' ON COMPLETION NOT PRESERVE ENABLE DO CALL cleanup_old_data()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
