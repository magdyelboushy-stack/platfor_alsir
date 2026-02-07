-- Database Schema for Bacaloria Platform

CREATE DATABASE IF NOT EXISTS bacaloria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bacaloria_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('student', 'parent', 'teacher', 'admin', 'assistant', 'support') DEFAULT 'student',
    permissions JSON NULL,
    
    -- Student Specific Fields
    education_stage ENUM('primary', 'prep', 'secondary') NULL,
    parent_phone VARCHAR(20) NULL,
    governorate VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    school_name VARCHAR(255) NULL,
    grade_level VARCHAR(50) NULL,
    
    birth_date DATE NULL,
    gender ENUM('male', 'female', 'ذكر', 'أنثى') NULL,
    guardian_name VARCHAR(255) NULL,
    
    avatar VARCHAR(255) NULL,
    bio TEXT NULL, -- Added profile bio
    status ENUM('pending', 'active', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Login Attempts Table for Rate Limiting
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email VARCHAR(255) NULL,
    attempts INT DEFAULT 1,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance and uniqueness
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
