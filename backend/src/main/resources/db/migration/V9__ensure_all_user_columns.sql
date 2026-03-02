-- V9: Ensure all user columns exist.
-- Same reason as V8 — V1 is baselined, so pre-Flyway databases may be missing columns.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
