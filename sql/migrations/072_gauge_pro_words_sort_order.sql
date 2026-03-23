-- ============================================================================
-- Migration 072: Add sort_order to gauge_pro_words
-- Enables admin-controlled adjective display order in the Gauge-Pro test
-- ============================================================================

ALTER TABLE gauge_pro_words ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Populate sort_order matching current IDs (preserves existing order)
UPDATE gauge_pro_words SET sort_order = id WHERE sort_order = 0;

-- Index for efficient dimension + order queries
CREATE INDEX IF NOT EXISTS idx_gauge_pro_words_dimension_sort ON gauge_pro_words(dimension, sort_order);
