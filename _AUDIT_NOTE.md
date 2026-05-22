# Audit Note — AIBeekeepingApiary

Source: portfolio standard audit (Node+Express+React+Postgres+OpenRouter).
Reference template: `/Users/erolakarsu/projects/AISpaceDebrisTracker/_AUDIT_NOTE.md`.
Domain: beekeeping / apiary management — hive inspection, varroa monitoring, honey yield, queen tracking, swarm prediction.

## Inventory snapshot

- **Backend** (`backend/server.js`, Express, JWT-guarded `/api` tree):
  - 18 CRUD route modules via `_crudFactory` + `_extendCrud`: `apiaries`, `hives`, `queens`, `inspections`, `treatments`, `honeyHarvests`, `supplies`, `equipment`, `beekeepers`, `pollinationContracts`, `customers`, `plantSources`, `weatherBriefs`, `diseaseOutbreaks`, `swarms`, `varroaCounts`, `hiveSounds`, `auditLog`.
  - Cross-cutting: `notifications`, `attachments`, `webhooks`, `dashboard`, `customViews`.
  - Created-hook interceptor on `diseaseOutbreaks` + `varroaCounts` fires `notifications` row + `fireWebhook(...)` on `critical`/`high`.
  - 16 AI verbs in `routes/ai.js` (409 lines) + `/samples` + `/history`, all routed through `services/ai.js` (OpenRouter) and persisted to `ai_analyses`.
- **Frontend** (`frontend/src/pages/`): 16 AI pages + 18 CRUD pages + Dashboard + LoginPage + CustomViews + Webhooks + AuditLog + two Codex feature pages.
- **Seed**: `backend/seed/seed.js` (555 lines).

## Original Recommendations

### Missing AI Counterparts
- **Hive-acoustic anomaly classifier** — generic acoustic anomaly detection (varroa stress, queenlessness drift, robbing, swarm prep) distinct from current narrow `queen-status-from-sound`.
- **Varroa-risk scorer from inspection notes** — pre-count probabilistic risk from free-text inspection narratives + brood pattern + drone count; current `varroa-treatment-recommend` assumes a count already exists.
- **Queen-health assessor** — multi-signal queen vitality score (laying pattern, brood gap, supersedure cells, age) — current sound-based check is one input only.
- **AI mentor / coach for new beekeepers** — context-aware Q&A drawing on the apiary's own state.
- **Weather-aware foraging optimizer** — joint optimizer over forecast, plant phenology, and apiary placement; today's `weather-impact-brief` + `plant-source-map` are read-only briefs, not an optimizer.

### Already-covered AI counterparts (no action)
- Swarm-risk predict (`swarm-risk-predict`), honey-yield forecast (`harvest-forecast`), treatment recommender (`varroa-treatment-recommend` + `treatment-efficacy-analyze`), multi-yard / pollination route planner (`pollination-route-plan`).

### Missing Non-AI Features
- **Queen lineage / pedigree graph** — `queens` CRUD exists but no genealogy traversal endpoint (mother → daughters, inbreeding flag, hygienic-trait lineage).
- **Market price feeds** — honey, wax, queens, pollen, propolis spot pricing ingestion + history (no `marketPrices` route today).
- **EPA / state pesticide setback compliance** — geofenced setback distances vs. apiary locations and treatment label restrictions.
- **Treatment label / withdrawal-period registry** — structured drug/strip metadata with re-entry intervals (currently free-text on `treatments`).

### Already-covered Non-AI Features (no action)
- Inspection CRUD, treatment log, varroa counts, swarm log, honey harvests, attachments, webhooks, audit log, notifications, dashboard, custom views.

### Custom Feature Suggestions
- Weather-aware foraging optimizer (see AI section).
- AI mentor for new beekeepers (see AI section).
- Multi-yard route planner — **already covered** by `pollination-route-plan`.
- Apiary biosecurity scoring (combines disease outbreaks + neighbor density + treatment log).
- Pollination contract revenue optimizer (price × travel × hive-strength fit).
- Genetic-resilience tracker against treatment-resistant varroa lines.

## Implemented (this round)

None — audit-only.

## Backlog (prioritized)

1. **MECHANICAL** `POST /api/ai/hive-acoustic-anomaly` — classify recorded hive-sound clip metadata into anomaly categories with confidence + recommended inspection focus. Wire from existing `hive_sounds` table.
2. **MECHANICAL** `POST /api/ai/varroa-risk-score` — score risk from inspection narrative + brood metrics before a count is taken; emit recommended sampling cadence.
3. **MECHANICAL** `POST /api/ai/queen-health-assess` — multi-signal vitality score from `queens` + recent `inspections` joined input.
4. **MECHANICAL** `POST /api/ai/beekeeper-mentor` — RAG-lite Q&A over the user's own apiary state (apiary, hives, recent inspections, treatments) as system context.
5. **MECHANICAL** `POST /api/ai/foraging-optimizer` — join `weather_briefs` + `plant_sources` + `apiaries` to return placement/movement recommendations.
6. **MECHANICAL** `GET /api/queens/:id/lineage` — recursive CTE traversal of mother/daughter relationships.
7. **MECHANICAL** Add `treatment_labels` reference table + `/api/treatment-labels` CRUD, link to `treatments.label_id`.
8. **NEEDS-PRODUCT-DECISION** Pesticide setback compliance — needs geofence dataset choice (EPA Bee Where? state registries?).
9. **NEEDS-CREDS** Market price feeds — pick provider (USDA NASS honey report, ABF, third-party API).
10. **NEEDS-PRODUCT-DECISION** Biosecurity score, contract revenue optimizer, genetic-resilience tracker (scope first).

## Files relevant to follow-up passes
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/server.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/routes/ai.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/services/ai.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/routes/queens.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/routes/treatments.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/backend/seed/seed.js`
- `/Users/erolakarsu/projects/AIBeekeepingApiary/frontend/src/pages/` (16 AI + 18 CRUD pages)

## Apply pass 7 (full backlog implementation)

### New AI verbs (5 MECHANICAL)
- `POST /api/ai/hive-acoustic-anomaly` — generic anomaly classifier (varroa stress, robbing, swarm prep, queenlessness drift). Pulls last 5 rows from `hive_sounds` when `hive_id` given.
- `POST /api/ai/varroa-risk-score` — pre-count risk from narrative + brood metrics. Joins last 5 `inspections`.
- `POST /api/ai/queen-health-assess` — multi-signal queen vitality. Joins `queens` + 5 latest `inspections` for the queen's hive.
- `POST /api/ai/beekeeper-mentor` — RAG-lite Q&A grounded in current `apiaries` + `hives` + recent `inspections` + `treatments`; persists Q&A to `mentor_threads`.
- `POST /api/ai/foraging-optimizer` — joint optimizer over `weather_briefs` + `plant_sources` + `apiaries`.

All five share the existing `runAi` recording pattern (`ai_results` row per call). Sample fills added to `SAMPLES`.

### New non-AI MECHANICAL
- `GET /api/queens/:id/lineage` — mother→daughters traversal parsing `mother=<queen_id>` from `queens.notes`; inbreeding flag (shared ancestor within 3 generations) + hygienic-trait lineage flag.
- `treatment_labels` reference table + full CRUD at `/api/treatment-labels`; `treatments.label_id` column added for linkage (nullable, no breaking change).

### NEEDS-PRODUCT-DECISION (resolved w/ reasonable defaults)
- **Pesticide setback compliance** — `pesticide_setbacks` table + `/api/pesticide-setbacks` CRUD. EPA bee-toxicity baseline distances: `low=0 m, moderate=30 m, high=100 m, highly_toxic=500 m`. Exposes `/baseline` (read-only ref) and `/:id/compliance` (per-row evaluation).
- **Biosecurity score** — `biosecurity_scores` table + CRUD + `/compute/:apiary_id` deterministic formula: `100 − 18·open_outbreaks − 12·critical_outbreaks − 10·varroa_critical − 4·neighbors(<=6) + 3·treatments_last_60d(<=10)`, clamped to [0,100], banded `low|medium|high|critical`.
- **Contract revenue optimizer** — `contract_revenue_models` table + CRUD + `/optimize/:contract_id` computing `margin = gross − travel`, travel at USD 1.85/km × 250 km default; hive-fit from available colonies vs. `hives_committed`.
- **Genetic resilience tracker** — `genetic_resilience_records` table + CRUD + `/score/:queen_id` banding `avg(VSH, hygienic)` into `vulnerable|susceptible|tolerant|resistant`, with one-tier bump when `varroa_load_post < 2`.

### NEEDS-CREDS (503 stubs)
- **Market price feeds** — `market_prices` table + manual CRUD operational; `POST /api/market-prices/ingest` returns 503 with `needs_creds: ['USDA_NASS_API_KEY','ABF_API_KEY']` and candidate provider list.

### Schema (migration `003_schema.sql`)
- New tables: `treatment_labels`, `pesticide_setbacks`, `market_prices`, `biosecurity_scores`, `contract_revenue_models`, `genetic_resilience_records`, `mentor_threads`.
- ALTER: `treatments.label_id` (nullable VARCHAR(50)).
- `seed/seed.js` extended: DROPs new tables, runs migration 003, inserts 5 rows per new domain.

### Frontend
- New AI pages: `AIHiveAcousticAnomalyPage`, `AIVarroaRiskScorePage`, `AIQueenHealthAssessPage`, `AIBeekeeperMentorPage`, `AIForagingOptimizerPage`.
- New CRUD/feature pages: `TreatmentLabelsPage`, `PesticideSetbacksPage` (shows EPA baseline), `MarketPricesPage` (with "Try Ingest" button surfacing the 503 stub), `BiosecurityScoresPage` (with `compute` form), `ContractRevenueModelsPage` (with `optimize` form), `GeneticResiliencePage` (with `score` form), `QueenLineagePage`.
- Routes added in `App.js`; sidebar now has "Compliance" + "Commercial" groups; `AI_INSPECTION_EXT` adds 3 new AI inspection verbs; 2 new AI planning verbs appended.
- `services/api.js` extended with all new APIs + specialized endpoints.

### Verification
- `node --check` passed on every modified `.js` (server, all 6 new route modules, queens, treatments, ai, services/ai, seed, frontend services/api).
- No new dependencies. No existing route signatures broken.
- New routes mount before `app.listen` (no explicit 404 handler in this app — order preserved).

### Skipped
- USDA NASS / ABF live ingestion (503 stub only — NEEDS-CREDS as specified).

### Status
DONE.
