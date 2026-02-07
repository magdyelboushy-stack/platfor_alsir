-- Migration: Add subject column to evaluations table
ALTER TABLE evaluations ADD COLUMN subject VARCHAR(100) AFTER grade_level;

-- Index for performance
CREATE INDEX idx_evaluations_subject ON evaluations(subject);
