-- Migration: Add resource_type to evaluations table
ALTER TABLE evaluations ADD COLUMN resource_type ENUM('evaluation', 'study_material') DEFAULT 'evaluation' AFTER subject;
