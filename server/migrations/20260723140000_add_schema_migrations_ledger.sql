CREATE TABLE IF NOT EXISTS schema_migrations (
  filename VARCHAR(255) NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (filename)
);

INSERT INTO schema_migrations (filename) VALUES ('20260723140000_add_schema_migrations_ledger.sql');
