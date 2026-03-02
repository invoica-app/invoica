-- V8: Ensure all invoice columns exist.
-- V1 is always baselined (skipped), so on databases created before Flyway
-- was added, some V1 columns may be missing. This migration fills the gaps.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_address VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_city VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_zip VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_country VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_company VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_subject VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_message VARCHAR(2000);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes VARCHAR(2000);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DOUBLE PRECISION;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount DOUBLE PRECISION;
