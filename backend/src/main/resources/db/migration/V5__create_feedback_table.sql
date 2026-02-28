CREATE TABLE feedback (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id),
    type            VARCHAR(20) NOT NULL,
    category        VARCHAR(20),
    rating          INTEGER,
    nps_score       INTEGER,
    ease_score      INTEGER,
    message         TEXT,
    invoice_id      BIGINT,
    page            VARCHAR(255),
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
