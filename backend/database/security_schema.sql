-- ================================================
-- Security Schema (Universal Compatibility)
-- ================================================

-- Create Database if not exists and Select it
CREATE DATABASE IF NOT EXISTS bacaloria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bacaloria_db;

-- Helper Procedure to safely add columns (Idempotent)
DROP PROCEDURE IF EXISTS SafeAddColumn;
DELIMITER $$
CREATE PROCEDURE SafeAddColumn(
    IN p_table_name VARCHAR(255),
    IN p_column_name VARCHAR(255),
    IN p_column_definition TEXT
)
BEGIN
    DECLARE col_count INT;
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = p_table_name
    AND column_name = p_column_name
    AND table_schema = DATABASE();

    IF col_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Helper Procedure to safely add indexes
DROP PROCEDURE IF EXISTS SafeAddIndex;
DELIMITER $$
CREATE PROCEDURE SafeAddIndex(
    IN p_table_name VARCHAR(255),
    IN p_index_name VARCHAR(255),
    IN p_index_columns TEXT
)
BEGIN
    DECLARE idx_count INT;
    SELECT COUNT(*) INTO idx_count
    FROM information_schema.statistics
    WHERE table_name = p_table_name
    AND index_name = p_index_name
    AND table_schema = DATABASE();

    IF idx_count = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD INDEX ', p_index_name, ' (', p_index_columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- 1. Users Table Updates
CALL SafeAddColumn('users', 'email_verified', 'TINYINT(1) DEFAULT 0');
CALL SafeAddColumn('users', 'verification_token', 'VARCHAR(64) NULL');
CALL SafeAddColumn('users', 'password_reset_token', 'VARCHAR(64) NULL');
CALL SafeAddColumn('users', 'password_reset_expires', 'DATETIME NULL');
CALL SafeAddColumn('users', 'failed_login_attempts', 'INT DEFAULT 0');
CALL SafeAddColumn('users', 'last_failed_login', 'DATETIME NULL');
CALL SafeAddColumn('users', 'last_login', 'DATETIME NULL');
CALL SafeAddColumn('users', 'ip_address', 'VARCHAR(45) NULL');
CALL SafeAddColumn('users', 'user_agent', 'TEXT NULL');
CALL SafeAddColumn('users', 'two_factor_enabled', 'TINYINT(1) DEFAULT 0');
CALL SafeAddColumn('users', 'two_factor_secret', 'VARCHAR(255) NULL');
CALL SafeAddColumn('users', 'account_locked_until', 'DATETIME NULL');
CALL SafeAddColumn('users', 'deleted_at', 'DATETIME NULL COMMENT "Soft delete"');

CALL SafeAddIndex('users', 'idx_email_verified', 'email_verified');
CALL SafeAddIndex('users', 'idx_verification_token', 'verification_token');
CALL SafeAddIndex('users', 'idx_password_reset_token', 'password_reset_token');

-- 2. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    action VARCHAR(50) NOT NULL COMMENT 'create, update, delete, login, logout, etc.',
    table_name VARCHAR(50) NULL,
    record_id VARCHAR(36) NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Email Verification Logs
CREATE TABLE IF NOT EXISTS email_verification_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Password History
CREATE TABLE IF NOT EXISTS password_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    blocked_by VARCHAR(36) NULL,
    INDEX idx_ip_address (ip_address),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Login Attempts
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    success TINYINT(1) DEFAULT 0,
    failure_reason VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier (identifier),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure columns exist in login_attempts if table already existed
CALL SafeAddColumn('login_attempts', 'identifier', 'VARCHAR(255) NOT NULL');
CALL SafeAddColumn('login_attempts', 'ip_address', 'VARCHAR(45) NOT NULL');
CALL SafeAddColumn('login_attempts', 'user_agent', 'TEXT NULL');
CALL SafeAddColumn('login_attempts', 'success', 'TINYINT(1) DEFAULT 0');
CALL SafeAddColumn('login_attempts', 'failure_reason', 'VARCHAR(255) NULL');

-- 8. Suspicious Activities
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    ip_address VARCHAR(45) NOT NULL,
    activity_type VARCHAR(50) NOT NULL COMMENT 'sql_injection, xss_attempt, rate_limit, etc.',
    description TEXT NULL,
    request_uri TEXT NULL,
    request_data JSON NULL,
    user_agent TEXT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    handled TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_activity_type (activity_type),
    INDEX idx_severity (severity),
    INDEX idx_handled (handled),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Trusted Devices
CREATE TABLE IF NOT EXISTS trusted_devices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    device_id VARCHAR(64) NOT NULL UNIQUE,
    device_name VARCHAR(255) NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_device_id (device_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. 2FA Codes
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('login', 'password_reset', 'email_change') DEFAULT 'login',
    expires_at DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT UNSIGNED NOT NULL,
    permission_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Backups
CREATE TABLE IF NOT EXISTS backups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    type ENUM('full', 'incremental', 'differential') DEFAULT 'full',
    status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    encrypted TINYINT(1) DEFAULT 0,
    created_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up helpers at the END
DROP PROCEDURE SafeAddColumn;
DROP PROCEDURE SafeAddIndex;

-- Seed Roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrator - Full Access'),
('teacher', 'Teacher - Course Management'),
('student', 'Student - Standard Access'),
('parent', 'Parent - View Access')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Seed Permissions
INSERT INTO permissions (name, description) VALUES
('users.view', 'View Users'),
('users.create', 'Create Users'),
('users.edit', 'Edit Users'),
('users.delete', 'Delete Users'),
('courses.view', 'View Courses'),
('courses.create', 'Create Courses'),
('courses.edit', 'Edit Courses'),
('courses.delete', 'Delete Courses'),
('reports.view', 'View Reports'),
('settings.manage', 'Manage Settings')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Admin Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- Triggers

DELIMITER $$
CREATE TRIGGER IF NOT EXISTS save_password_history
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.password != NEW.password THEN
        INSERT INTO password_history (user_id, password_hash)
        VALUES (NEW.id, OLD.password);
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER IF NOT EXISTS log_user_deletion
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, ip_address, user_agent)
    VALUES (OLD.id, 'delete', 'users', OLD.id, 
            JSON_OBJECT('name', OLD.name, 'email', OLD.email),
            @current_ip, @current_user_agent);
END$$
DELIMITER ;

-- Views

CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT 
    identifier,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(created_at) as last_attempt,
    user_agent
FROM login_attempts
WHERE success = 0 
AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY identifier, ip_address
HAVING attempt_count >= 3
ORDER BY attempt_count DESC;

CREATE OR REPLACE VIEW unhandled_suspicious_activities AS
SELECT 
    id,
    user_id,
    ip_address,
    activity_type,
    severity,
    created_at,
    description
FROM suspicious_activities
WHERE handled = 0
ORDER BY 
    FIELD(severity, 'critical', 'high', 'medium', 'low'),
    created_at DESC;

-- Procedures

DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS cleanup_old_data()
BEGIN
    DELETE FROM login_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY));
    DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < NOW();
    DELETE FROM two_factor_codes WHERE expires_at < NOW();
    UPDATE users SET verification_token = NULL WHERE verification_token IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) AND email_verified = 0;
END$$
DELIMITER ;

-- Events

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL cleanup_old_data();
