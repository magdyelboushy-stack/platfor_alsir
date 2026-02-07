-- Activity Logs Table
-- Consolidated indexes into CREATE TABLE for better idempotency
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'profile_update', 'password_change', etc.
    description TEXT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_logs_user (user_id),
    INDEX idx_activity_logs_type (action_type)
);
