-- V3: Make invoice_number unique per user instead of globally unique.
-- Two different users can now have the same invoice number.

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;

ALTER TABLE invoices ADD CONSTRAINT uq_user_invoice_number UNIQUE (user_id, invoice_number);
