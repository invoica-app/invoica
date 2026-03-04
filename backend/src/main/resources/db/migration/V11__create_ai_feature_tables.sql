CREATE TABLE ai_feature_usage (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    feature          VARCHAR(50) NOT NULL DEFAULT 'invoice_analysis',
    sample_image_url TEXT,
    analysis_result  JSONB,
    success          BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_usage_user ON ai_feature_usage(user_id, feature);

CREATE TABLE ai_generated_templates (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(id),
    name             VARCHAR(255) NOT NULL,
    analysis_json    JSONB NOT NULL,
    sample_image_url TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_templates_user ON ai_generated_templates(user_id);
