-- V14: Remove leftover global uniqueness on invoice_number.
--
-- Invoice numbers are only intended to be unique per user. Some existing
-- databases still have a Hibernate-generated unique constraint on
-- invoices(invoice_number), for example uk_l1x55mfsay7co0r3m9ynvipd5.

DO $$
DECLARE
    constraint_name text;
BEGIN
    FOR constraint_name IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attname = 'invoice_number'
        WHERE n.nspname = current_schema()
          AND t.relname = 'invoices'
          AND c.contype = 'u'
          AND c.conkey = ARRAY[a.attnum]::smallint[]
    LOOP
        EXECUTE format('ALTER TABLE invoices DROP CONSTRAINT %I', constraint_name);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = current_schema()
          AND t.relname = 'invoices'
          AND c.conname = 'uq_user_invoice_number'
    ) THEN
        ALTER TABLE invoices ADD CONSTRAINT uq_user_invoice_number UNIQUE (user_id, invoice_number);
    END IF;
END $$;
