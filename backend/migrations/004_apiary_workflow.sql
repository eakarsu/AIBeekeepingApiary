CREATE TABLE IF NOT EXISTS inspection_workflow_events (
  id BIGSERIAL PRIMARY KEY,
  hive_id VARCHAR(50) NOT NULL,
  source_event_id VARCHAR(160) NOT NULL UNIQUE,
  inspected_at TIMESTAMPTZ NOT NULL,
  provenance JSONB NOT NULL,
  findings JSONB NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apiary_action_plans (
  id BIGSERIAL PRIMARY KEY,
  inspection_event_id BIGINT NOT NULL UNIQUE REFERENCES inspection_workflow_events(id) ON DELETE CASCADE,
  ruleset_version VARCHAR(120) NOT NULL,
  decision JSONB NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected','completed')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apiary_action_tasks (
  id BIGSERIAL PRIMARY KEY,
  plan_id BIGINT NOT NULL REFERENCES apiary_action_plans(id) ON DELETE CASCADE,
  task_type VARCHAR(140) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspection_workflow_hive_time ON inspection_workflow_events(hive_id, inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_apiary_action_plans_status ON apiary_action_plans(status);
