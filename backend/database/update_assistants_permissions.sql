-- Update Users Table to support Assistant Permissions
ALTER TABLE users ADD COLUMN permissions JSON NULL AFTER role;
