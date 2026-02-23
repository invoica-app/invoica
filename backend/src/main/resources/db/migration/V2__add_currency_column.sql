-- V2: Add currency column to invoices
-- Uses IF NOT EXISTS for safety since some databases may already have it.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(255) NOT NULL DEFAULT 'USD';
