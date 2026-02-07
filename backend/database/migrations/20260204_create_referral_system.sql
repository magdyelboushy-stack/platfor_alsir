-- Migration: Create referral system tables
CREATE TABLE IF NOT EXISTS evaluation_referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evaluation_id INT NOT NULL,
    sharer_uuid VARCHAR(64) NOT NULL,
    token VARCHAR(32) NOT NULL UNIQUE,
    target_count INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referral_visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referral_id INT NOT NULL,
    visitor_ip VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_id) REFERENCES evaluation_referrals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_visit (referral_id, visitor_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
