-- Apply pass 7 — full backlog implementation
-- Adds: treatment_labels reference table, pesticide_setbacks (EPA baseline),
--       market_prices stub, biosecurity_scores, contract_revenue_models,
--       genetic_resilience_records, mentor_threads.

-- Treatment label / withdrawal-period registry.
CREATE TABLE IF NOT EXISTS treatment_labels (
  id                       SERIAL PRIMARY KEY,
  label_id                 VARCHAR(50) UNIQUE,
  product                  VARCHAR(150) NOT NULL,
  active_ingredient        VARCHAR(150),
  manufacturer             VARCHAR(150),
  epa_reg_no               VARCHAR(80),
  withdrawal_days_honey    INTEGER DEFAULT 0,
  reentry_interval_hours   INTEGER DEFAULT 0,
  approved_temp_range_c    VARCHAR(40),
  resistance_class         VARCHAR(60),
  notes                    TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Link treatments → treatment_labels (no breaking changes; nullable).
ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS label_id VARCHAR(50);

-- Pesticide setback compliance (EPA Bee Where? baseline distances).
-- Default setback baseline distances in meters per EPA pesticide label
-- bee-toxicity standards (label-driven; 30 m foraging buffer / 200 m
-- highly toxic / 8 km drift-sensitive). NEEDS-PRODUCT-DECISION baseline.
CREATE TABLE IF NOT EXISTS pesticide_setbacks (
  id                  SERIAL PRIMARY KEY,
  setback_id          VARCHAR(50) UNIQUE,
  apiary_id           VARCHAR(50),
  pesticide           VARCHAR(150),
  toxicity_class      VARCHAR(40) DEFAULT 'moderate', -- low|moderate|high|highly_toxic
  required_setback_m  INTEGER DEFAULT 30,
  actual_setback_m    INTEGER,
  status              VARCHAR(30) DEFAULT 'compliant', -- compliant|violation|review
  source_authority    VARCHAR(80) DEFAULT 'EPA',
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Market price feed history (NEEDS-CREDS — feed ingestion is 503 stub).
CREATE TABLE IF NOT EXISTS market_prices (
  id              SERIAL PRIMARY KEY,
  price_id        VARCHAR(50) UNIQUE,
  commodity       VARCHAR(80), -- honey|wax|queens|pollen|propolis
  region          VARCHAR(120),
  unit            VARCHAR(30) DEFAULT 'lb',
  price_usd       NUMERIC(10,2) DEFAULT 0,
  reported_at     DATE,
  source          VARCHAR(80),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Biosecurity scoring (composite of outbreaks + neighbor density + treatments).
CREATE TABLE IF NOT EXISTS biosecurity_scores (
  id              SERIAL PRIMARY KEY,
  score_id        VARCHAR(50) UNIQUE,
  apiary_id       VARCHAR(50),
  score           NUMERIC(5,2) DEFAULT 0, -- 0..100
  tier            VARCHAR(20) DEFAULT 'medium', -- low|medium|high|critical
  drivers         TEXT,
  assessed_at     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pollination contract revenue model.
CREATE TABLE IF NOT EXISTS contract_revenue_models (
  id              SERIAL PRIMARY KEY,
  model_id        VARCHAR(50) UNIQUE,
  contract_id     VARCHAR(50),
  gross_usd       NUMERIC(12,2) DEFAULT 0,
  travel_cost_usd NUMERIC(12,2) DEFAULT 0,
  hive_fit_score  NUMERIC(5,2) DEFAULT 0,
  margin_usd      NUMERIC(12,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'draft',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Genetic resilience tracking (resistant varroa lines).
CREATE TABLE IF NOT EXISTS genetic_resilience_records (
  id                 SERIAL PRIMARY KEY,
  record_id          VARCHAR(50) UNIQUE,
  queen_id           VARCHAR(50),
  line_name          VARCHAR(150),
  vsh_score          NUMERIC(5,2),
  hygienic_score     NUMERIC(5,2),
  varroa_load_post   NUMERIC(6,2),
  resistance_rating  VARCHAR(30) DEFAULT 'unknown',
  assessed_at        DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Persisted beekeeper-mentor Q&A threads (RAG-lite history).
CREATE TABLE IF NOT EXISTS mentor_threads (
  id              SERIAL PRIMARY KEY,
  thread_id       VARCHAR(50) UNIQUE,
  user_email      VARCHAR(150),
  question        TEXT,
  answer          TEXT,
  context_summary TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentor_threads_user
  ON mentor_threads (user_email, created_at DESC);
