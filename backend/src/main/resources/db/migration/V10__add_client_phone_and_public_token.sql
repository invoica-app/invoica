ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS public_token VARCHAR(36);

-- Generate UUID tokens for existing invoices
UPDATE invoices SET public_token = gen_random_uuid()::text WHERE public_token IS NULL;

-- Make public_token unique and not null for future rows
ALTER TABLE invoices ALTER COLUMN public_token SET NOT NULL;
ALTER TABLE invoices ADD CONSTRAINT uq_invoices_public_token UNIQUE (public_token);
