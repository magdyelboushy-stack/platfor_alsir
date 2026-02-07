-- Migration: Add downloads_count to evaluations table
ALTER TABLE evaluations ADD COLUMN downloads_count INT DEFAULT 0 AFTER subject;
