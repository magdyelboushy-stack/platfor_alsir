-- Create uploaded_files table for file management
CREATE TABLE IF NOT EXISTS uploaded_files (
    id VARCHAR(36) PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for faster listing
CREATE INDEX idx_uploaded_files_created ON uploaded_files(created_at DESC);
