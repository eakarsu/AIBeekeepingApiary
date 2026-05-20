-- AIBeekeepingApiary schema — 17 domain entities + ai_results + audit_log

CREATE TABLE IF NOT EXISTS apiaries (
  id              SERIAL PRIMARY KEY,
  apiary_id       VARCHAR(50) UNIQUE,
  name            VARCHAR(200) NOT NULL,
  location        VARCHAR(200),
  hive_count      INTEGER DEFAULT 0,
  owner           VARCHAR(150),
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hives (
  id              SERIAL PRIMARY KEY,
  hive_id         VARCHAR(50) UNIQUE,
  apiary_id       VARCHAR(50),
  queen_id        VARCHAR(50),
  frame_count     INTEGER DEFAULT 0,
  last_inspection DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queens (
  id              SERIAL PRIMARY KEY,
  queen_id        VARCHAR(50) UNIQUE,
  hive_id         VARCHAR(50),
  breed           VARCHAR(80),
  year            INTEGER,
  marked          VARCHAR(20),
  status          VARCHAR(30) DEFAULT 'laying',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inspections (
  id              SERIAL PRIMARY KEY,
  inspection_id   VARCHAR(50) UNIQUE,
  hive_id         VARCHAR(50),
  inspector       VARCHAR(150),
  date            DATE,
  brood_pattern   VARCHAR(40),
  health          VARCHAR(40),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
  id              SERIAL PRIMARY KEY,
  treatment_id    VARCHAR(50) UNIQUE,
  hive_id         VARCHAR(50),
  product         VARCHAR(150),
  dosage          VARCHAR(100),
  applied_at      DATE,
  status          VARCHAR(30) DEFAULT 'applied',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS honey_harvests (
  id              SERIAL PRIMARY KEY,
  harvest_id      VARCHAR(50) UNIQUE,
  hive_id         VARCHAR(50),
  kg              NUMERIC(10,2) DEFAULT 0,
  type            VARCHAR(80),
  harvested_at    DATE,
  status          VARCHAR(30) DEFAULT 'in_storage',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplies (
  id              SERIAL PRIMARY KEY,
  supply_id       VARCHAR(50) UNIQUE,
  item            VARCHAR(200),
  qty             INTEGER DEFAULT 0,
  location        VARCHAR(150),
  reorder_point   INTEGER DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'in_stock',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id              SERIAL PRIMARY KEY,
  eq_id           VARCHAR(50) UNIQUE,
  type            VARCHAR(80),
  sn              VARCHAR(100),
  location        VARCHAR(150),
  last_service    DATE,
  status          VARCHAR(30) DEFAULT 'operational',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beekeepers (
  id              SERIAL PRIMARY KEY,
  beekeeper_id    VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  certifications  VARCHAR(250),
  base            VARCHAR(150),
  hives_managed   INTEGER DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pollination_contracts (
  id              SERIAL PRIMARY KEY,
  contract_id     VARCHAR(50) UNIQUE,
  customer_id     VARCHAR(50),
  crop            VARCHAR(120),
  hives_committed INTEGER DEFAULT 0,
  fee_usd         NUMERIC(12,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id              SERIAL PRIMARY KEY,
  customer_id     VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  type            VARCHAR(60),
  region          VARCHAR(120),
  last_contract   DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plant_sources (
  id              SERIAL PRIMARY KEY,
  source_id       VARCHAR(50) UNIQUE,
  common_name     VARCHAR(150),
  distance_km     NUMERIC(8,2) DEFAULT 0,
  blooms_at       VARCHAR(80),
  nectar_yield    VARCHAR(40),
  status          VARCHAR(30) DEFAULT 'available',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_briefs (
  id              SERIAL PRIMARY KEY,
  brief_id        VARCHAR(50) UNIQUE,
  location        VARCHAR(150),
  valid_at        TIMESTAMPTZ,
  temperature_c   NUMERIC(5,1),
  wind_kt         NUMERIC(5,1),
  forecast        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disease_outbreaks (
  id              SERIAL PRIMARY KEY,
  outbreak_id     VARCHAR(50) UNIQUE,
  apiary_id       VARCHAR(50),
  disease         VARCHAR(120),
  severity        VARCHAR(20) DEFAULT 'medium',
  opened_at       DATE,
  status          VARCHAR(30) DEFAULT 'open',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swarms (
  id              SERIAL PRIMARY KEY,
  swarm_id        VARCHAR(50) UNIQUE,
  source_hive     VARCHAR(50),
  location        VARCHAR(200),
  caught_at       TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'captured',
  captured_by     VARCHAR(150),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS varroa_counts (
  id                  SERIAL PRIMARY KEY,
  count_id            VARCHAR(50) UNIQUE,
  hive_id             VARCHAR(50),
  mites_per_100_bees  NUMERIC(6,2) DEFAULT 0,
  sampled_at          DATE,
  status              VARCHAR(30) DEFAULT 'monitoring',
  action              VARCHAR(150),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hive_sounds (
  id              SERIAL PRIMARY KEY,
  sound_id        VARCHAR(50) UNIQUE,
  hive_id         VARCHAR(50),
  recording_url   VARCHAR(500),
  captured_at     TIMESTAMPTZ,
  classification  VARCHAR(80),
  confidence      NUMERIC(5,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  entry_id        VARCHAR(50) UNIQUE,
  actor           VARCHAR(150),
  target          VARCHAR(200),
  action          VARCHAR(80),
  result          VARCHAR(80),
  ts              TIMESTAMPTZ DEFAULT NOW(),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);
