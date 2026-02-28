ALTER TABLE invoices ADD COLUMN template_id VARCHAR(50) DEFAULT 'modern';
ALTER TABLE invoices ADD COLUMN authorized_signature VARCHAR(255);
