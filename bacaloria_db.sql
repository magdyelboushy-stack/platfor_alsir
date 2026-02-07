-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 05, 2026 at 09:37 PM
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
-- Database: `bacaloria_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `cleanup_old_data` ()   BEGIN
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `batch_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assigned_to` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redeemed_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `redeemed_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','used','expired','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone`, `password`, `avatar`, `status`, `created_at`, `updated_at`) VALUES
('1758b0426318f8e3f5baa69ac21df58f804d', 'مدير النظام', 'admin@bacaloria.com', '01000000000', '$argon2id$v=19$m=65536,t=4,p=3$R2svMlNpdXZQd2FIdVh6TA$lD3W6DlxELdAyAHMJ7DG38rOwXe60WbQxMo/6ZYeU2k', NULL, 'active', '2026-02-01 16:24:44', '2026-02-01 16:24:44');

-- --------------------------------------------------------

--
-- Table structure for table `anti_cheat_logs`
--

CREATE TABLE `anti_cheat_logs` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_type` enum('tab_switch','copy_paste','right_click','fullscreen_exit','devtools','screenshot') COLLATE utf8mb4_unicode_ci NOT NULL,
  `logged_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metadata` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assistants`
--

CREATE TABLE `assistants` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'المعلم المسؤول',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL COMMENT 'الصلاحيات ["courses:view", "students:view"]',
  `status` enum('pending','active','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'create, update, delete, login, logout, etc.',
  `table_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `created_at`) VALUES
(436, '25ebcf31-dbba-444c-bb47-cafc740958fb', 'delete', 'users', '25ebcf31-dbba-444c-bb47-cafc740958fb', '{\"name\": \"احمد\", \"email\": \"ahmeds@gmail.com\"}', NULL, NULL, NULL, '2026-02-03 09:48:31'),
(437, '4b0381dc-2fef-425a-b4c0-ea3557d11e12', 'delete', 'users', '4b0381dc-2fef-425a-b4c0-ea3557d11e12', '{\"name\": \"مجدي محمد مجدي\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-03 09:48:31'),
(438, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 09:50:25'),
(439, '1758b0426318f8e3f5baa69ac21df58f804d', 'create', 'teachers', 'e7a941c2857fc7fa688b192a8feb1803365e', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"email\": \"s@gmail.com\", \"subject\": \"الجغرافيا\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 09:53:50'),
(440, '1758b0426318f8e3f5baa69ac21df58f804d', 'create', 'teachers', '4f2ade48fb7e2d581dbff81df996c377c681', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"email\": \"ss@gmail.com\", \"subject\": \"الرياضيات\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 09:59:35'),
(441, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:10:21'),
(442, '4f2ade48fb7e2d581dbff81df996c377c681', 'login', 'teachers', '4f2ade48fb7e2d581dbff81df996c377c681', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:10:36'),
(443, '4f2ade48fb7e2d581dbff81df996c377c681', 'create_assistant', 'assistants', 'b2e53bd5700591a784cef909e6b87ec1d785', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:11:04'),
(444, 'b2e53bd5700591a784cef909e6b87ec1d785', 'login', 'assistants', 'b2e53bd5700591a784cef909e6b87ec1d785', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:11:32'),
(445, 'b2e53bd5700591a784cef909e6b87ec1d785', 'create_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', '\"4f2ade48fb7e2d581dbff81df996c377c681\"', '{\"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:12:16'),
(446, 'b2e53bd5700591a784cef909e6b87ec1d785', 'create_section', 'course_sections', '5f1959d5-8f62-4d86-bc19-22885bca2e25', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:12:18'),
(447, 'b2e53bd5700591a784cef909e6b87ec1d785', 'create_lesson', 'lessons', '60f208f3-64e8-4f63-a6b9-3f8400b6cf02', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:12:19'),
(448, 'b2e53bd5700591a784cef909e6b87ec1d785', 'create_lesson', 'lessons', 'f35c5327-c268-48f1-94f6-ed4199d614e4', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:12:24'),
(449, 'b2e53bd5700591a784cef909e6b87ec1d785', 'create_lesson', 'lessons', '9b3a057e-ef89-4ac0-b701-01a934a6a34b', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"assistant\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:12:30'),
(450, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:15:37'),
(451, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:15:52'),
(452, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:15:55'),
(453, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:15:56'),
(454, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:18:58'),
(455, '4f2ade48fb7e2d581dbff81df996c377c681', 'update_course', 'courses', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:20:44'),
(456, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 13:55:48'),
(457, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 14:22:57'),
(458, '1758b0426318f8e3f5baa69ac21df58f804d', 'create', 'teachers', '7974ee88917f0b5dd77de4346554a35802f8', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"email\": \"mohamedelnadar@gmail.com\", \"subject\": \"الجغرافيا\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 14:24:58'),
(459, '1758b0426318f8e3f5baa69ac21df58f804d', 'create', 'teachers', '43985391a5d4388618775178e10edd92a098', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"email\": \"muhammadaman@gmail.com\", \"subject\": \"الغة الإنجليزية\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 14:27:39'),
(460, 'ec997100-39c1-49e1-8395-78e1a9c2d03b', 'login', 'students', 'ec997100-39c1-49e1-8395-78e1a9c2d03b', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 14:53:57'),
(461, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:03:15'),
(462, '7974ee88917f0b5dd77de4346554a35802f8', 'login', 'teachers', '7974ee88917f0b5dd77de4346554a35802f8', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:07:07'),
(463, '7974ee88917f0b5dd77de4346554a35802f8', 'create_course', 'courses', '0e374e15-e48b-4a5e-becb-3c894e34c03c', '\"7974ee88917f0b5dd77de4346554a35802f8\"', '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:08:08'),
(464, '7974ee88917f0b5dd77de4346554a35802f8', 'create_section', 'course_sections', 'fb599478-0e6f-418c-91f2-a926a46581e7', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:08:10'),
(465, '7974ee88917f0b5dd77de4346554a35802f8', 'create_lesson', 'lessons', '51d2a181-d4cc-4be1-80d5-5a844cb6784f', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:08:12'),
(466, '7974ee88917f0b5dd77de4346554a35802f8', 'create_lesson', 'lessons', '61b538e3-3397-4c42-a762-5dcb072e2a6d', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:08:12'),
(467, '7974ee88917f0b5dd77de4346554a35802f8', 'create_lesson', 'lessons', 'a1b5333e-c6d9-45cf-8829-2c2a7cd262c1', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"teacher\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-03 15:08:13'),
(468, 'ec997100-39c1-49e1-8395-78e1a9c2d03b', 'login', 'students', 'ec997100-39c1-49e1-8395-78e1a9c2d03b', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1\"}, \"device\": \"Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1\"}', '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-02-03 15:20:34'),
(469, '1758b0426318f8e3f5baa69ac21df58f804d', 'login', 'admins', '1758b0426318f8e3f5baa69ac21df58f804d', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 11:54:21'),
(470, 'ec997100-39c1-49e1-8395-78e1a9c2d03b', 'delete', 'users', 'ec997100-39c1-49e1-8395-78e1a9c2d03b', '{\"name\": \"مجدي محمد مجدي\", \"email\": \"magdymohamed1929@gmail.com\"}', NULL, NULL, NULL, '2026-02-05 11:54:35'),
(471, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 11:56:36'),
(472, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 11:59:08'),
(473, '1758b0426318f8e3f5baa69ac21df58f804d', 'approve_user', 'users', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"admin\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 12:03:34'),
(474, '60445988-9bd0-499d-9aee-dc4d8be20b34', 'sms_verification_success', 'users', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"_meta\": {\"ip\": \"::1\", \"role\": \"guest\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 12:03:53'),
(475, '60445988-9bd0-499d-9aee-dc4d8be20b34', 'login', 'students', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 12:03:55'),
(476, '60445988-9bd0-499d-9aee-dc4d8be20b34', 'login', 'students', '60445988-9bd0-499d-9aee-dc4d8be20b34', NULL, '{\"ip\": \"::1\", \"_meta\": {\"ip\": \"::1\", \"role\": \"student\", \"agent\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}, \"device\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-05 12:04:04');

-- --------------------------------------------------------

--
-- Table structure for table `backups`
--

CREATE TABLE `backups` (
  `id` bigint UNSIGNED NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` bigint NOT NULL,
  `type` enum('full','incremental','differential') COLLATE utf8mb4_unicode_ci DEFAULT 'full',
  `status` enum('pending','in_progress','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `encrypted` tinyint(1) DEFAULT '0',
  `created_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_ips`
--

CREATE TABLE `blocked_ips` (
  `id` bigint UNSIGNED NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `blocked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `blocked_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `objectives` text COLLATE utf8mb4_unicode_ci,
  `thumbnail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_video_url` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT '0.00',
  `education_stage` enum('primary','prep','secondary') COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `objectives`, `thumbnail`, `intro_video_url`, `price`, `education_stage`, `grade_level`, `subject`, `status`, `teacher_id`, `created_at`, `updated_at`) VALUES
('0e374e15-e48b-4a5e-becb-3c894e34c03c', 'sad', 'asd', '[\"asd\"]', NULL, NULL, 600.00, 'prep', 'third_prep', 'الجغرافيا', 'published', '7974ee88917f0b5dd77de4346554a35802f8', '2026-02-03 15:08:08', '2026-02-03 15:08:08'),
('85c87f9e-c885-45bd-8cc5-e7dc31c79597', 'sss', 'sss', '[\"\\u0633\"]', '/api/files/thumbnails/course_thumb_5e7ce61b5c5af1b2675d522d4579e47c.jpg', 'https://www.youtube.com/watch?v=ZvOucenhvmI', 400.00, 'prep', 'third_prep', 'الرياضيات', 'published', NULL, '2026-02-03 13:12:16', '2026-02-03 13:20:44');

-- --------------------------------------------------------

--
-- Table structure for table `course_sections`
--

CREATE TABLE `course_sections` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_sections`
--

INSERT INTO `course_sections` (`id`, `course_id`, `title`, `sort_order`, `created_at`) VALUES
('5f1959d5-8f62-4d86-bc19-22885bca2e25', '85c87f9e-c885-45bd-8cc5-e7dc31c79597', 'قسم جديدsad', 0, '2026-02-03 13:12:18'),
('fb599478-0e6f-418c-91f2-a926a46581e7', '0e374e15-e48b-4a5e-becb-3c894e34c03c', 'قسم جديد', 0, '2026-02-03 15:08:10');

-- --------------------------------------------------------

--
-- Table structure for table `email_verification_log`
--

CREATE TABLE `email_verification_log` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enrolled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `progress_percent` int DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int NOT NULL DEFAULT '30',
  `pass_score` int DEFAULT '50',
  `max_attempts` int DEFAULT '1',
  `is_randomized` tinyint(1) DEFAULT '0',
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempt_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `selected_option_ids` text COLLATE utf8mb4_unicode_ci,
  `essay_answer` text COLLATE utf8mb4_unicode_ci,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_earned` int DEFAULT '0',
  `answered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `time_spent_seconds` int DEFAULT '0',
  `score` int DEFAULT '0',
  `total_points` int DEFAULT '0',
  `percentage` decimal(5,2) DEFAULT '0.00',
  `passed` tinyint(1) DEFAULT '0',
  `status` enum('in_progress','submitted','timed_out','voided') COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `anti_cheat_violations` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_questions`
--

CREATE TABLE `exam_questions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('single','multiple','true_false','essay') COLLATE utf8mb4_unicode_ci DEFAULT 'single',
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `points` int DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `explanation` text COLLATE utf8mb4_unicode_ci,
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `content_type` enum('video','pdf','exam') COLLATE utf8mb4_unicode_ci DEFAULT 'video',
  `content_url` text COLLATE utf8mb4_unicode_ci,
  `duration_minutes` int DEFAULT '0',
  `is_preview` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `section_id`, `title`, `description`, `content_type`, `content_url`, `duration_minutes`, `is_preview`, `sort_order`, `created_at`) VALUES
('51d2a181-d4cc-4be1-80d5-5a844cb6784f', 'fb599478-0e6f-418c-91f2-a926a46581e7', 'درس جديد', NULL, 'video', NULL, 0, 0, 0, '2026-02-03 15:08:12'),
('60f208f3-64e8-4f63-a6b9-3f8400b6cf02', '5f1959d5-8f62-4d86-bc19-22885bca2e25', 'درس جديدsad', 'asd', 'video', NULL, 0, 0, 0, '2026-02-03 13:12:19'),
('61b538e3-3397-4c42-a762-5dcb072e2a6d', 'fb599478-0e6f-418c-91f2-a926a46581e7', 'درس جديد', NULL, 'exam', NULL, 0, 0, 0, '2026-02-03 15:08:12'),
('9b3a057e-ef89-4ac0-b701-01a934a6a34b', '5f1959d5-8f62-4d86-bc19-22885bca2e25', 'درس جديد', NULL, 'pdf', '/api/files/documents/teacher_file_96ee13a973db896d86e27f7c28774481.pdf', 0, 0, 0, '2026-02-03 13:12:30'),
('a1b5333e-c6d9-45cf-8829-2c2a7cd262c1', 'fb599478-0e6f-418c-91f2-a926a46581e7', 'درس جديد', NULL, 'pdf', NULL, 0, 0, 0, '2026-02-03 15:08:13'),
('f35c5327-c268-48f1-94f6-ed4199d614e4', '5f1959d5-8f62-4d86-bc19-22885bca2e25', 'درس جديدasd', 'asd', 'exam', 'ffa4a03e-3959-4298-a89b-d9c00f06b17a', 0, 0, 0, '2026-02-03 13:12:24');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attempts` int DEFAULT '1',
  `last_attempt_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `identifier` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `success` tinyint(1) DEFAULT '0',
  `failure_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `ip_address`, `email`, `attempts`, `last_attempt_at`, `blocked_until`, `created_at`, `identifier`, `user_agent`, `success`, `failure_reason`) VALUES
(81, '::1', NULL, 1, '2026-02-01 16:59:51', NULL, '2026-02-01 16:59:51', '01156820932', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(82, '::1', NULL, 1, '2026-02-01 17:00:10', NULL, '2026-02-01 17:00:10', 'magdy@teacher.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(83, '::1', NULL, 1, '2026-02-02 06:46:53', NULL, '2026-02-02 06:46:53', 'admin@bacaloria.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(84, '::1', NULL, 1, '2026-02-03 08:42:44', NULL, '2026-02-03 08:42:44', '01234567829', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', 1, NULL),
(85, '::1', NULL, 1, '2026-02-03 08:42:49', NULL, '2026-02-03 08:42:49', '01234567829', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', 1, NULL),
(86, '::1', NULL, 1, '2026-02-03 09:21:25', NULL, '2026-02-03 09:21:25', 'ss@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(87, '::1', NULL, 1, '2026-02-03 13:10:10', NULL, '2026-02-03 13:10:10', 'admin@bacaloria.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(88, '::1', NULL, 1, '2026-02-03 13:10:30', NULL, '2026-02-03 13:10:30', 'ss@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(89, '::1', NULL, 1, '2026-02-03 13:21:38', NULL, '2026-02-03 13:21:38', 'magdymohamed1929@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(90, '::1', NULL, 1, '2026-02-03 13:21:48', NULL, '2026-02-03 13:21:48', 'magdymohamed1929@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(91, '::1', NULL, 1, '2026-02-03 13:21:54', NULL, '2026-02-03 13:21:54', 'magdymohamed1929@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(92, '::1', NULL, 1, '2026-02-03 14:51:01', NULL, '2026-02-03 14:51:01', 'magdymohamed1929@gmail.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL),
(93, '::1', NULL, 1, '2026-02-05 11:54:13', NULL, '2026-02-05 11:54:13', 'admin@bacaloria.com', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `password_history`
--

CREATE TABLE `password_history` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
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
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `is_correct` tinyint(1) DEFAULT '0',
  `wrong_explanation` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Administrator - Full Access', '2026-01-24 08:57:49'),
(2, 'teacher', 'Teacher - Course Management', '2026-01-24 08:57:49'),
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
  `id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`, `created_at`) VALUES
('1426rfr8s80ud5l28515r8v06l', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEzMDk4Mzs=', 1770130983, '2026-02-03 15:03:03'),
('1djpp40i75fjf7jddd4riumq14', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDE0MzI0NTs=', 1770143245, '2026-02-03 18:27:25'),
('1dlm1kfkd3slbb8k7o4d7tiq4i', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDE0MzI0NTs=', 1770143245, '2026-02-03 18:27:25'),
('1n750795l9l6je3v64omkh1q41', NULL, '::1', '', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MDoiIjtsYXN0X3JlZ2VuZXJhdGlvbnxpOjE3NzAyOTM5MTc7', 1770293917, '2026-02-05 12:18:37'),
('27ub93jhpfp2sbauod10kk3ild', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTI1OiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYgRWRnLzE0NC4wLjAuMCI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwMTEyMTE1Ow==', 1770112118, '2026-02-03 09:48:35'),
('2a0ivlvuq12tpt91c4ou2jhgo5', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDE0MzI0NDs=', 1770143244, '2026-02-03 18:27:24'),
('2vtf3pnfo1b2h0a9nou9uneurs', NULL, '::1', '', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MDoiIjtsYXN0X3JlZ2VuZXJhdGlvbnxpOjE3NzAyOTQxMzk7', 1770294139, '2026-02-05 12:22:19'),
('3cil2qln4j0mmg9olvh6b1hobn', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEzMTkxMzs=', 1770131913, '2026-02-03 15:18:33'),
('3euhpinli04hbalneo8d90n673', '60445988-9bd0-499d-9aee-dc4d8be20b34', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDI5NTQwNDtjc3JmX3Rva2VufHM6NjQ6ImRmYmFiZTNiOTViNWFjMjczNzE3MGNmYTY4MmI1NTE3ZDU0NWNjNDhmZDc4Yzg3YmU3MGU1Nzc2YTVhZDNiNDAiO3VzZXJfaWR8czozNjoiNjA0NDU5ODgtOWJkMC00OTlkLTlhZWUtZGM0ZDhiZTIwYjM0Ijtyb2xlfHM6Nzoic3R1ZGVudCI7bG9naW5fdGltZXxpOjE3NzAyOTMwNDQ7Z3JhZGVfbGV2ZWx8czoxOiI5IjtlZHVjYXRpb25fc3RhZ2V8czo0OiJwcmVwIjs=', 1770295544, '2026-02-05 12:43:24'),
('3vtltvabr0g629dgplmi1i5753', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDI5NTQwNDs=', 1770295404, '2026-02-05 12:43:24'),
('4m4t8odb7tilm0b23j8uhmka32', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNDE5MTs=', 1770124191, '2026-02-03 13:09:51'),
('6mpmog1t6ktp5gsokspsagl7c5', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTI1OiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYgRWRnLzE0NC4wLjAuMCI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwMTEyMTM3Ow==', 1770112137, '2026-02-03 09:48:57'),
('6ur3c1pr51jairf4hlt85hq7g8', 'ec997100-39c1-49e1-8395-78e1a9c2d03b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEzMDQzNztjc3JmX3Rva2VufHM6NjQ6IjhkMjEyN2VkN2UwNDEwZWFhMDQ0YTFjNTY5NGU4NzA5NmY4MzJlYjU3MzA4YWRhY2NiZWU0MWZmMDQzZGRhZjIiO3VzZXJfaWR8czozNjoiZWM5OTcxMDAtMzljMS00OWUxLTgzOTUtNzhlMWE5YzJkMDNiIjtyb2xlfHM6Nzoic3R1ZGVudCI7bG9naW5fdGltZXxpOjE3NzAxMzA0Mzc7Z3JhZGVfbGV2ZWx8czoxOiI5IjtlZHVjYXRpb25fc3RhZ2V8czo0OiJwcmVwIjs=', 1770130831, '2026-02-03 14:53:57'),
('83r7n809b7s415q0utkuhslgoe', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNDg5NDtjc3JmX3Rva2VufHM6NjQ6ImNjNmRkMWY3N2M2MTAyYjMwZGZhYTFiNzgyZjBlMzI2MTVmYzk4MjVhYmExNjMwYThiMjZiZWYzNzY0OTBmOTEiOw==', 1770124894, '2026-02-03 13:21:34'),
('av0kdglmc3r8k7ap4rpa5h0jo0', NULL, '::1', '', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MDoiIjtsYXN0X3JlZ2VuZXJhdGlvbnxpOjE3NzAyOTQxNDY7', 1770294148, '2026-02-05 12:22:28'),
('b0tt75tr0rkr4vjih0sc0uub3e', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNDA1NDs=', 1770124056, '2026-02-03 13:07:35'),
('f5jt20jah5jg2i6pplsnl2e5gk', '1758b0426318f8e3f5baa69ac21df58f804d', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNjk0ODtjc3JmX3Rva2VufHM6NjQ6IjgzZTY5ZWUxYmExYTAwMGFkNDQ3ZWQyMWRlNGYxZWMzNGUxNTAzNGQxMzEwMDAyZmJkNDVmNDNlZTAyODk1MmMiO3VzZXJfaWR8czozNjoiMTc1OGIwNDI2MzE4ZjhlM2Y1YmFhNjlhYzIxZGY1OGY4MDRkIjtyb2xlfHM6NToiYWRtaW4iO2xvZ2luX3RpbWV8aToxNzcwMTI2OTQ4O3N1YmplY3R8czoxODoi2KfZhNix2YrYp9i22YrYp9iqIjtncmFkZV9sZXZlbHN8czoyMjE6IlsiXHUwNjI3XHUwNjQ0XHUwNjM1XHUwNjQxIFx1MDYyN1x1MDY0NFx1MDYyM1x1MDY0OFx1MDY0NCBcdTA2MjdcdTA2NDRcdTA2MjVcdTA2MzlcdTA2MmZcdTA2MjdcdTA2MmZcdTA2NGEiLCJcdTA2MjdcdTA2NDRcdTA2MzVcdTA2NDEgXHUwNjI3XHUwNjQ0XHUwNjJiXHUwNjI3XHUwNjQ2XHUwNjRhIFx1MDYyN1x1MDY0NFx1MDYyNVx1MDYzOVx1MDYyZlx1MDYyN1x1MDYyZlx1MDY0YSJdIjs=', 1770127282, '2026-02-03 13:55:48'),
('ha58kh9re54rhbpgj8phs54g14', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyOTgyOTs=', 1770129829, '2026-02-03 14:43:49'),
('hv801bbcgs0kmth829rlkpcqdg', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNjg1ODs=', 1770126858, '2026-02-03 13:54:18'),
('i265m9k82gp24bieuqh2d30gqp', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNjg1ODs=', 1770126858, '2026-02-03 13:54:18'),
('j20jodtvd1vgqitd7qp17ut9j1', NULL, '::1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTMxOiJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wOyBOZXh1cyA1IEJ1aWxkL01SQTU4TikgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzE0NC4wLjAuMCBNb2JpbGUgU2FmYXJpLzUzNy4zNiI7bGFzdF9yZWdlbmVyYXRpb258aToxNzcwMTI0ODMyOw==', 1770124833, '2026-02-03 13:20:32'),
('juo6okekcgsbp8dsnke0nti41n', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDE0MzI0NDs=', 1770143244, '2026-02-03 18:27:24'),
('khsedrmc4fjlr62uqdifiqqv22', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDI5NTQwNDs=', 1770295405, '2026-02-05 12:43:24'),
('lkq1stlb99e7b5761t78t22tk0', 'b2e53bd5700591a784cef909e6b87ec1d785', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNjg1ODtjc3JmX3Rva2VufHM6NjQ6ImY4MmIzNjUwNjMzYWM2YjE2NmJlYWY1NjNjODcyNjJiM2M3YjAyMjVmNDNlOGFmOGFjMDQ3MjY2MTZjNzc1MGEiO3VzZXJfaWR8czozNjoiYjJlNTNiZDU3MDA1OTFhNzg0Y2VmOTA5ZTZiODdlYzFkNzg1Ijtyb2xlfHM6OToiYXNzaXN0YW50Ijtsb2dpbl90aW1lfGk6MTc3MDEyNDI5MjtwZXJtaXNzaW9uc3xhOjI1OntpOjA7czoxNDoiZGFzaGJvYXJkOnZpZXciO2k6MTtzOjEyOiJjb3Vyc2VzOnZpZXciO2k6MjtzOjE0OiJjb3Vyc2VzOmNyZWF0ZSI7aTozO3M6MTI6ImNvdXJzZXM6ZWRpdCI7aTo0O3M6MTQ6ImNvdXJzZXM6ZGVsZXRlIjtpOjU7czoxMDoiZXhhbXM6dmlldyI7aTo2O3M6MTI6ImV4YW1zOmNyZWF0ZSI7aTo3O3M6MTA6ImV4YW1zOmVkaXQiO2k6ODtzOjEyOiJleGFtczpkZWxldGUiO2k6OTtzOjEwOiJmaWxlczp2aWV3IjtpOjEwO3M6MTI6ImZpbGVzOnVwbG9hZCI7aToxMTtzOjEyOiJmaWxlczpkZWxldGUiO2k6MTI7czoxMDoiY29kZXM6dmlldyI7aToxMztzOjE0OiJjb2RlczpnZW5lcmF0ZSI7aToxNDtzOjEyOiJjb2RlczpkZWxldGUiO2k6MTU7czoxMzoic3R1ZGVudHM6dmlldyI7aToxNjtzOjEzOiJzdHVkZW50czplZGl0IjtpOjE3O3M6MTY6InN0dWRlbnRzOnN1c3BlbmQiO2k6MTg7czoxNToic3R1ZGVudHM6ZGVsZXRlIjtpOjE5O3M6MTE6IndhbGxldDp2aWV3IjtpOjIwO3M6MTU6IndhbGxldDp3aXRoZHJhdyI7aToyMTtzOjEyOiJzdXBwb3J0OnZpZXciO2k6MjI7czoxNToic3VwcG9ydDpyZXNwb25kIjtpOjIzO3M6MTM6ImhvbWV3b3JrOnZpZXciO2k6MjQ7czoxNDoiaG9tZXdvcms6Z3JhZGUiO310ZWFjaGVyX2lkfHM6MzY6IjRmMmFkZTQ4ZmI3ZTJkNTgxZGJmZjgxZGY5OTZjMzc3YzY4MSI7', 1770127282, '2026-02-03 13:54:18'),
('mqeoov38mckudhaecnu988t3rl', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDI5MjUwMzs=', 1770292503, '2026-02-05 11:55:03'),
('muj4u2vll1h0t68dpqu9vk4o5t', '1758b0426318f8e3f5baa69ac21df58f804d', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDI5NTQwNDtjc3JmX3Rva2VufHM6NjQ6IjI5MzFhZDlkMGRlMGJkNWZiOGEzYjE3Mjk0N2VjNDcxYzQ1NzVmNDBjMDA4M2EwODVkNWM4MjZiNjc3NjFiMDgiO3VzZXJfaWR8czozNjoiMTc1OGIwNDI2MzE4ZjhlM2Y1YmFhNjlhYzIxZGY1OGY4MDRkIjtyb2xlfHM6NToiYWRtaW4iO2xvZ2luX3RpbWV8aToxNzcwMjkyNDYxOw==', 1770295544, '2026-02-05 12:43:24'),
('o2busp817up3fs8mh7ivved24s', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEyNDEwOTs=', 1770124111, '2026-02-03 13:08:29'),
('ofm7s6ss6rkts9m13lvpg3fvk5', NULL, '::1', '', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MDoiIjtsYXN0X3JlZ2VuZXJhdGlvbnxpOjE3NzAyOTM5NjQ7', 1770293966, '2026-02-05 12:19:26'),
('pbo3jbnkrc34jc1qeabi57h7v0', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEzMTg4NDs=', 1770131884, '2026-02-03 15:18:04'),
('rk8nna31utkmk9mmguk3bvf1f2', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTExOiJNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvMTQ0LjAuMC4wIFNhZmFyaS81MzcuMzYiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDEzMjQ3NDs=', 1770132474, '2026-02-03 15:27:54'),
('sausm7cf61oojfnefqr4melope', NULL, '::1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', 'aXBfYWRkcmVzc3xzOjM6Ijo6MSI7aXBfY2hhbmdlX2NvdW50fGk6MDt1c2VyX2FnZW50fHM6MTM1OiJNb3ppbGxhLzUuMCAoaVBob25lOyBDUFUgaVBob25lIE9TIDE4XzUgbGlrZSBNYWMgT1MgWCkgQXBwbGVXZWJLaXQvNjA1LjEuMTUgKEtIVE1MLCBsaWtlIEdlY2tvKSBWZXJzaW9uLzE4LjUgTW9iaWxlLzE1RTE0OCBTYWZhcmkvNjA0LjEiO2xhc3RfcmVnZW5lcmF0aW9ufGk6MTc3MDE0MzI0NDs=', 1770143244, '2026-02-03 18:27:24');

-- --------------------------------------------------------

--
-- Table structure for table `suspicious_activities`
--

CREATE TABLE `suspicious_activities` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'sql_injection, xss_attempt, rate_limit, etc.',
  `description` text COLLATE utf8mb4_unicode_ci,
  `request_uri` text COLLATE utf8mb4_unicode_ci,
  `request_data` json DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `handled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`key`, `value`, `updated_at`) VALUES
('accent_color', '#36342d', '2026-02-02 09:13:42'),
('address', 'القاهرة، مصر', '2026-02-03 13:56:01'),
('app_name', 'السير الشامي', '2026-02-02 10:34:02'),
('contact_email', 'contact@alsershami.com', '2026-02-03 13:56:01'),
('contact_phone', '01156820932', '2026-02-03 13:56:38'),
('facebook_group', '#https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('facebook_url', 'https://www.facebook.com/Bastnhalk', '2026-02-03 14:50:00'),
('instagram_url', 'https://www.facebook.com/p/%D9%85%D8%AD%D9%85%D8%AF-%D8%A7%D9%84%D9%86%D8%B6%D8%A7%D8%B1-Mr-mohamed-elnadar-100090610424563/', '2026-02-03 13:57:06'),
('primary_color', '#88830e', '2026-02-02 09:13:42'),
('secondary_color', '#16a3f6', '2026-02-02 09:13:42'),
('telegram_group', 'https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('telegram_url', 'https://t.me/Bastnhalk', '2026-02-03 14:50:00'),
('tiktok_url', 'https://www.tiktok.com/@bastnhalk?_t=8pDlwYV6ZKk&_r=1', '2026-02-03 14:50:00'),
('whatsapp_group', 'https://bio.link/bastnhalk', '2026-02-03 14:50:10'),
('whatsapp_number', '+201156820932', '2026-02-03 13:56:57'),
('youtube_url', 'https://www.youtube.com/@Bastnhalk', '2026-02-03 14:50:00');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'اسم المعلم',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'البريد الإلكتروني',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'رقم الهاتف',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'كلمة المرور المشفرة',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'الصورة الشخصية',
  `banner` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci COMMENT 'نبذة تعريفية عن المعلم',
  `subject` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'المادة الدراسية',
  `grade_levels` json NOT NULL COMMENT 'الصفوف الدراسية ["أول ثانوي", "ثاني ثانوي"]',
  `education_stages` json DEFAULT NULL COMMENT 'المراحل التعليمية ["primary", "prep", "secondary"]',
  `status` enum('pending','active','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'حالة الحساب',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `name`, `email`, `phone`, `password`, `avatar`, `banner`, `bio`, `subject`, `grade_levels`, `education_stages`, `status`, `created_at`, `updated_at`) VALUES
('43985391a5d4388618775178e10edd92a098', 'محمد أمان', 'muhammadaman@gmail.com', '010 61287911', '$argon2id$v=19$m=65536,t=4,p=3$ZnNhaWxPYThMWU9uTjZpdA$CES7/fqmE2fodhpFdA9PAFLIYRySsqiVgB10urnYI9c', '/uploads/avatars/698205db0b873_535069355_801210432259160_1888936423505782215_n.jpg', '/uploads/banners/698205db0bad7_534962148_801210692259134_5387763278814170781_n.jpg', 'جوكر اللغة ألانجليزية للشهادة الاعداديه والثانويه 💥💥', 'الغة الإنجليزية', '\"[\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u0623\\\\u0648\\\\u0644 \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u064a \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u064a \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u0648\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u0623\\\\u0648\\\\u0644 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u0648\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0644\\\\u062b \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0644\\\\u062b \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u0648\\\\u064a\\\"]\"', '\"[]\"', 'active', '2026-02-03 14:27:39', '2026-02-03 14:27:39'),
('7974ee88917f0b5dd77de4346554a35802f8', 'محمد النضار', 'mohamedelnadar@gmail.com', '01013380962', '$argon2id$v=19$m=65536,t=4,p=3$TW5CVi9QUk5pbWZWaE5aVA$o1qDY6c4WuLTF4q6Dg/5fnqp4n4v2jjTU6wxGunfVH4', '/uploads/avatars/6982053a9c299_542763170_739552752408399_1355108343665292115_n.jpg', '/uploads/banners/6982053a9c650_542802038_739552332408441_820721378907351421_n.jpg', 'اســــتاذ جغرافــــيــــا ♥️🌍\r\nدراسات اجتـــمـاعــيــة\r\nحاصل علي ليسانس في الاداب والتربية كلية تربية جامعة عين شمس _ تخصص جغرافيا ونظم معلومات جغرافية ✨\r\n', 'الجغرافيا', '\"[\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u0623\\\\u0648\\\\u0644 \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u064a \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0644\\\\u062b \\\\u0627\\\\u0644\\\\u0625\\\\u0639\\\\u062f\\\\u0627\\\\u062f\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u0623\\\\u0648\\\\u0644 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u0648\\\\u064a\\\",\\\"\\\\u0627\\\\u0644\\\\u0635\\\\u0641 \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u064a \\\\u0627\\\\u0644\\\\u062b\\\\u0627\\\\u0646\\\\u0648\\\\u064a\\\"]\"', '\"[]\"', 'active', '2026-02-03 14:24:58', '2026-02-03 14:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_files`
--

CREATE TABLE `teacher_files` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` enum('local','cloudinary','external') COLLATE utf8mb4_unicode_ci DEFAULT 'local',
  `size` bigint DEFAULT '0',
  `downloads` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit','withdrawal','purchase','activation') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trusted_devices`
--

CREATE TABLE `trusted_devices` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_factor_codes`
--

CREATE TABLE `two_factor_codes` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('login','password_reset','email_change') COLLATE utf8mb4_unicode_ci DEFAULT 'login',
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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','parent','teacher','admin','assistant','support') COLLATE utf8mb4_unicode_ci DEFAULT 'student',
  `permissions` json DEFAULT NULL,
  `teacher_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `school_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grade_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `governorate` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_stage` enum('primary','prep','secondary') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('male','female','ذكر','أنثى') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardian_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','active','blocked') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `last_session_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `last_failed_login` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_secret` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_locked_until` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete',
  `sms_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_sms_verified` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `permissions`, `teacher_id`, `parent_phone`, `school_name`, `grade_level`, `governorate`, `city`, `education_stage`, `birth_date`, `gender`, `guardian_name`, `avatar`, `bio`, `status`, `last_session_id`, `created_at`, `updated_at`, `email_verified`, `verification_token`, `password_reset_token`, `password_reset_expires`, `failed_login_attempts`, `last_failed_login`, `last_login`, `ip_address`, `user_agent`, `two_factor_enabled`, `two_factor_secret`, `account_locked_until`, `deleted_at`, `sms_code`, `is_sms_verified`) VALUES
('60445988-9bd0-499d-9aee-dc4d8be20b34', 'مجدي محمد', 'magdymohamed1929@gmail.com', '$argon2id$v=19$m=65536,t=4,p=3$SmR4RmhTNGxKUGFweHFlRQ$sSPbCLALI7AIG2ASqvZtyw4Q1HVc53bitFspsLN3B9Y', '01156820932', 'student', NULL, NULL, '01228585932', NULL, '9', 'الجيزة', 'الحوامدية', 'prep', '2010-04-05', 'male', 'محمد مجدي', 'avatars/avatar_191c9dac449ed8f302b67b931e913b50.jpg', NULL, 'active', NULL, '2026-02-05 11:55:56', '2026-02-05 12:19:24', 0, '7e401342ff0072e49208ee73556f0342b0c314dd86e59defcc14e857d63a3c67', NULL, NULL, 0, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, NULL, NULL, NULL, '457130', 0),
('e65253c2-e976-4b29-96a5-48754320cb7d', 'سشي', 'Ttew2@gmail.com', '$argon2id$v=19$m=65536,t=4,p=3$dC5BUEsxdkZNU0cvamhwLg$HtJZ+8CM/4CEBPYOMUU3DmeGd/QbeA2peGwKqgWrQGw', '01123456789', 'student', NULL, NULL, '01245787987', NULL, '9', 'الجيزة', 'الحوامدية', 'prep', '2010-04-05', 'male', 'asdqewqe ', 'avatars/avatar_1f60d9104f461d242175f8023d29b6d7.jpg', NULL, 'pending', NULL, '2026-02-05 12:20:17', '2026-02-05 12:20:17', 0, 'a0525d588ba4223329bed5188a74d892724347d1d325a71aeb8a6c07ad2a9f98', NULL, NULL, 0, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', 0, NULL, NULL, NULL, NULL, 0);

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
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
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
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_teacher` (`teacher_id`);

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
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stage_grade` (`education_stage`,`grade_level`),
  ADD KEY `fk_course_teacher` (`teacher_id`);

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
  ADD KEY `idx_teacher` (`teacher_id`),
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
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_subject` (`subject`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `teacher_files`
--
ALTER TABLE `teacher_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `fk_teacher_files_owner` (`teacher_id`);

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=477;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

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
-- Constraints for table `assistants`
--
ALTER TABLE `assistants`
  ADD CONSTRAINT `assistants_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `exams_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `exams_teacher_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `teacher_files`
--
ALTER TABLE `teacher_files`
  ADD CONSTRAINT `fk_teacher_files_owner` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

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
CREATE DEFINER=`root`@`localhost` EVENT `daily_cleanup` ON SCHEDULE EVERY 1 DAY STARTS '2026-01-24 10:59:36' ON COMPLETION NOT PRESERVE ENABLE DO CALL cleanup_old_data()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
