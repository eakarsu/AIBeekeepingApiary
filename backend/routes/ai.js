const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const ai = require('../services/ai');

async function record(feature, input, output) {
  try {
    await pool.query(
      'INSERT INTO ai_results (feature, input, output) VALUES ($1, $2, $3)',
      [feature, input || {}, output || {}]
    );
  } catch (e) {
    console.warn(`[ai] failed to record ${feature}:`, e.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Sample fills (5 per verb) — realistic beekeeping scenarios.
// ──────────────────────────────────────────────────────────────
const SAMPLES = {
  'queen-status-from-sound': [
    { label: 'HV-1003 — queenless warble suspected', values: { hive_id: 'HV-1003', captured_at: '2026-05-08 10:00Z', notes: 'High-pitched piping, broken roar' } },
    { label: 'HV-1005 — silent / queenless',         values: { hive_id: 'HV-1005', captured_at: '2026-05-12 11:15Z', notes: 'Low hum, no piping' } },
    { label: 'HV-1009 — swarm preparing',            values: { hive_id: 'HV-1009', captured_at: '2026-05-07 11:30Z', notes: 'Buildup hum + queen cell observed' } },
    { label: 'HV-1010 — weak colony',                values: { hive_id: 'HV-1010', captured_at: '2026-05-06 14:00Z', notes: 'Sparse sound, low density' } },
    { label: 'HV-1001 — healthy queenright',         values: { hive_id: 'HV-1001', captured_at: '2026-05-10 09:00Z', notes: 'Steady contented roar' } },
  ],
  'varroa-treatment-recommend': [
    { label: 'HV-1010 critical (7.5 mites/100)', values: { hive_id: 'HV-1010', mites_per_100_bees: 7.5, season: 'late spring' } },
    { label: 'HV-1009 high (6.2)',               values: { hive_id: 'HV-1009', mites_per_100_bees: 6.2, season: 'late spring' } },
    { label: 'HV-1015 critical (5.1)',           values: { hive_id: 'HV-1015', mites_per_100_bees: 5.1, season: 'late spring' } },
    { label: 'HV-1003 threshold (3.1)',          values: { hive_id: 'HV-1003', mites_per_100_bees: 3.1, season: 'late spring' } },
    { label: 'HV-1013 threshold (4.0)',          values: { hive_id: 'HV-1013', mites_per_100_bees: 4.0, season: 'late spring' } },
  ],
  'swarm-risk-predict': [
    { label: 'Yard AP-001 (sample)', values: { apiary_id: 'AP-001', notes: 'Strong nectar flow, no recent splits' } },
    { label: 'Yard AP-007 (DWV present)', values: { apiary_id: 'AP-007', notes: 'High population, mild weather' } },
    { label: 'Yard AP-009 (almonds done)', values: { apiary_id: 'AP-009', notes: 'Post-almond buildup, congestion likely' } },
    { label: 'Yard AP-003 (Yakima)', values: { apiary_id: 'AP-003', notes: 'Apple bloom peak, brood explosion' } },
    { label: 'Yard AP-006 (Pine River)', values: { apiary_id: 'AP-006', notes: 'Stable population, modest flow' } },
  ],
  'pollination-route-plan': [
    { label: 'CA almonds (3 stops)',  values: { stops: ['Modesto CA','Bakersfield CA','Yuma AZ'], total_hives: 200 } },
    { label: 'PNW berries / apples',  values: { stops: ['Lynden WA','Hood River OR','Yakima WA'], total_hives: 120 } },
    { label: 'Plains canola / sunflower', values: { stops: ['Bismarck ND','Minot ND','Lincoln NE'], total_hives: 150 } },
    { label: 'WI cranberries + GL crops',  values: { stops: ['Wisconsin Rapids WI','Madison WI'], total_hives: 80 } },
    { label: 'NW orchards loop',     values: { stops: ['Salem OR','Bend OR','Yakima WA'], total_hives: 100 } },
  ],
  'hive-strength-trend': [
    { label: 'HV-1001', values: { hive_id: 'HV-1001' } },
    { label: 'HV-1005', values: { hive_id: 'HV-1005' } },
    { label: 'HV-1009', values: { hive_id: 'HV-1009' } },
    { label: 'HV-1011', values: { hive_id: 'HV-1011' } },
    { label: 'HV-1015', values: { hive_id: 'HV-1015' } },
  ],
  'executive-brief': [
    { label: 'Default snapshot — no bias', values: { notes: '' } },
    { label: 'Bias toward pollination contracts', values: { notes: 'Focus on pollination revenue, contract delivery risk, transport readiness.' } },
    { label: 'Bias toward disease/varroa response', values: { notes: 'Focus on disease outbreaks, varroa critical hives, treatment scheduling.' } },
    { label: 'Bias toward honey production', values: { notes: 'Focus on harvest forecast, honey yield by yard, supply (jars/filters).' } },
    { label: 'Bias toward labor and equipment', values: { notes: 'Focus on beekeeper utilization, equipment service needs, and supply reorders.' } },
  ],
  'harvest-forecast': [
    { label: '6-week wildflower forecast',         values: { horizon_weeks: 6, type: 'Wildflower' } },
    { label: '4-week clover forecast',             values: { horizon_weeks: 4, type: 'Clover' } },
    { label: '8-week orange blossom forecast',     values: { horizon_weeks: 8, type: 'Orange blossom' } },
    { label: '4-week almond post-bloom forecast',  values: { horizon_weeks: 4, type: 'Almond' } },
    { label: '10-week multi-yard total forecast',  values: { horizon_weeks: 10, type: 'mixed' } },
  ],
  'treatment-efficacy-analyze': [
    { label: 'Apivar — all hives',       values: { product: 'Apivar (amitraz)' } },
    { label: 'Apiguard — all hives',     values: { product: 'Apiguard (thymol)' } },
    { label: 'Formic Pro — all hives',   values: { product: 'Formic Pro' } },
    { label: 'Oxalic acid (all forms)',  values: { product: 'Oxalic acid' } },
    { label: 'All products combined',    values: { product: '' } },
  ],
  'customer-quote': [
    { label: 'Almond pollination — 120 hives, 21 days',   values: { customer: 'Central Valley Almond Growers', crop: 'Almonds',     hives: 120, weeks: 3 } },
    { label: 'Blueberry pollination — 40 hives, 14 days', values: { customer: 'Cascade Blueberry Co-op',       crop: 'Blueberries', hives: 40,  weeks: 2 } },
    { label: 'Apple pollination — 30 hives, 14 days',     values: { customer: 'Yakima Apple Partners',         crop: 'Apples',      hives: 30,  weeks: 2 } },
    { label: 'Cranberry pollination — 35 hives, 14 days', values: { customer: 'Wisconsin Cranberry Marsh',     crop: 'Cranberries', hives: 35,  weeks: 2 } },
    { label: 'Avocado pollination — 28 hives, 21 days',   values: { customer: 'Coastal Avocado Growers',       crop: 'Avocados',    hives: 28,  weeks: 3 } },
  ],
  'weather-impact-brief': [
    { label: 'Sonoma County, CA',   values: { location: 'Sonoma County, CA' } },
    { label: 'Modesto, CA',         values: { location: 'Modesto, CA' } },
    { label: 'Tucson, AZ',          values: { location: 'Tucson, AZ' } },
    { label: 'Bend, OR',            values: { location: 'Bend, OR' } },
    { label: 'Madison, WI',         values: { location: 'Madison, WI' } },
  ],
  'disease-outbreak-summary': [
    { label: 'AFB at AP-005 (critical)',  values: { outbreak_id: 'DOB-2026-001' } },
    { label: 'EFB at AP-008 (high)',      values: { outbreak_id: 'DOB-2026-002' } },
    { label: 'Pesticide kill at AP-009',  values: { outbreak_id: 'DOB-2026-012' } },
    { label: 'DWV at AP-007 (high)',      values: { outbreak_id: 'DOB-2026-007' } },
    { label: 'Varroa overload at AP-004', values: { outbreak_id: 'DOB-2026-006' } },
  ],
  'supply-resupply-plan': [
    { label: 'Default (all supplies)',         values: {} },
    { label: 'Focus on treatments',            values: { focus: 'treatments' } },
    { label: 'Focus on bottling',              values: { focus: 'bottling' } },
    { label: 'Focus on hive woodenware',       values: { focus: 'woodenware' } },
    { label: 'Focus on emergency feed',        values: { focus: 'feed' } },
  ],
  'beekeeper-schedule': [
    { label: 'Week starting Mon (default)',     values: { week_start: '2026-05-18' } },
    { label: 'Almond pollination week',         values: { week_start: '2026-05-25', focus: 'pollination delivery' } },
    { label: 'Inspection-heavy week',           values: { week_start: '2026-06-01', focus: 'inspections' } },
    { label: 'Harvest week',                    values: { week_start: '2026-06-08', focus: 'harvest' } },
    { label: 'Outbreak response week',          values: { week_start: '2026-05-18', focus: 'disease response AFB' } },
  ],
  'plant-source-map': [
    { label: 'AP-001 Meadow Ridge',  values: { apiary_id: 'AP-001' } },
    { label: 'AP-009 Almond Bloom',  values: { apiary_id: 'AP-009' } },
    { label: 'AP-003 Orchard Crest', values: { apiary_id: 'AP-003' } },
    { label: 'AP-007 Heritage Field',values: { apiary_id: 'AP-007' } },
    { label: 'AP-010 High Desert',   values: { apiary_id: 'AP-010' } },
  ],
  'equipment-prognostic': [
    { label: 'Default (all equipment)', values: {} },
    { label: 'Focus on extractors',     values: { focus: 'extractor' } },
    { label: 'Focus on vehicles',       values: { focus: 'truck' } },
    { label: 'Focus on hive scales',    values: { focus: 'scale' } },
    { label: 'Focus on bottling line',  values: { focus: 'bottling' } },
  ],
  'vendor-quote-compare': [
    { label: 'Apivar strips',       values: { item: 'Apivar strips (pack of 10)' } },
    { label: 'Wooden frames (deep)', values: { item: 'Wooden frames (deep)' } },
    { label: '1lb honey jars (case 12)', values: { item: '1lb honey jars (case 12)' } },
    { label: 'Sugar syrup (gallon)', values: { item: 'Sugar syrup (gallon)' } },
    { label: 'Hive bodies (10-frame deep)', values: { item: 'Hive bodies (10-frame deep)' } },
  ],
};

// GET /api/ai/samples?feature=<verb>
router.get('/samples', (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    if (!feature) return res.json({ features: Object.keys(SAMPLES) });
    const samples = SAMPLES[feature];
    if (!samples) return res.status(404).json({ error: `unknown feature: ${feature}` });
    res.json({ feature, samples });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/ai/history?feature=<name>&limit=<n>
router.get('/history', async (req, res) => {
  try {
    const feature = (req.query.feature || '').toString();
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 200);
    let r;
    if (feature) {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results WHERE feature = $1 ORDER BY created_at DESC LIMIT $2',
        [feature, limit]
      );
    } else {
      r = await pool.query(
        'SELECT id, feature, input, output, created_at FROM ai_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
    }
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Helper that wraps an AI service call with DB recording.
function runAi(featureName, serviceFn) {
  return async (req, res) => {
    try {
      const input = req.body || {};
      const result = await serviceFn(input);
      await record(featureName, input, result);
      res.json(result);
    } catch (e) { res.status(500).json({ error: e.message }); }
  };
}

// 1. queen-status-from-sound
router.post('/queen-status-from-sound', async (req, res) => {
  try {
    const input = req.body || {};
    if (input.hive_id && !input.recording_url) {
      const r = await pool.query('SELECT * FROM hive_sounds WHERE hive_id = $1 ORDER BY captured_at DESC LIMIT 1', [input.hive_id]);
      if (r.rows[0]) input.latest_recording = r.rows[0];
    }
    const result = await ai.queenStatusFromSound(input);
    await record('queen-status-from-sound', input, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. varroa-treatment-recommend
router.post('/varroa-treatment-recommend', async (req, res) => {
  try {
    const input = req.body || {};
    if (input.hive_id && input.mites_per_100_bees == null) {
      const r = await pool.query('SELECT * FROM varroa_counts WHERE hive_id = $1 ORDER BY sampled_at DESC LIMIT 1', [input.hive_id]);
      if (r.rows[0]) input.mites_per_100_bees = Number(r.rows[0].mites_per_100_bees);
    }
    const result = await ai.varroaTreatmentRecommend(input);
    await record('varroa-treatment-recommend', input, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. swarm-risk-predict
router.post('/swarm-risk-predict', async (req, res) => {
  try {
    const input = req.body || {};
    let hives = input.hives;
    if (!hives) {
      const apiaryFilter = input.apiary_id ? 'WHERE apiary_id = $1' : '';
      const params = input.apiary_id ? [input.apiary_id] : [];
      const r = await pool.query(`SELECT * FROM hives ${apiaryFilter} ORDER BY id LIMIT 20`, params);
      hives = r.rows;
    }
    const enriched = { ...input, hives };
    const result = await ai.swarmRiskPredict(enriched);
    await record('swarm-risk-predict', { ...input, hives_count: hives.length }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. pollination-route-plan
router.post('/pollination-route-plan', async (req, res) => {
  try {
    const input = req.body || {};
    if (!input.contracts) {
      const r = await pool.query("SELECT * FROM pollination_contracts WHERE status='active' ORDER BY id LIMIT 15");
      input.active_contracts = r.rows;
    }
    const result = await ai.pollinationRoutePlan(input);
    await record('pollination-route-plan', input, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. hive-strength-trend
router.post('/hive-strength-trend', async (req, res) => {
  try {
    const input = req.body || {};
    if (input.hive_id) {
      const [hv, ins] = await Promise.all([
        pool.query('SELECT * FROM hives WHERE hive_id = $1 LIMIT 1', [input.hive_id]),
        pool.query('SELECT * FROM inspections WHERE hive_id = $1 ORDER BY date DESC LIMIT 10', [input.hive_id]),
      ]);
      input.hive = hv.rows[0];
      input.recent_inspections = ins.rows;
    }
    const result = await ai.hiveStrengthTrend(input);
    await record('hive-strength-trend', input, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. executive-brief
router.post('/executive-brief', async (req, res) => {
  try {
    const [apiaries, hives, queens, treatments, outbreaks, harvests, contracts, varroa] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total FROM apiaries"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='strong') AS strong, COUNT(*) FILTER (WHERE status='moderate') AS moderate, COUNT(*) FILTER (WHERE status='weak') AS weak FROM hives"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='failing') AS failing FROM queens"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='scheduled') AS scheduled FROM treatments"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='open') AS open, COUNT(*) FILTER (WHERE severity='critical') AS critical FROM disease_outbreaks"),
      pool.query("SELECT COALESCE(SUM(kg),0) AS total_kg FROM honey_harvests"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(fee_usd),0) AS total_fee FROM pollination_contracts"),
      pool.query("SELECT COUNT(*) FILTER (WHERE status='critical') AS critical FROM varroa_counts"),
    ]);
    const snapshot = {
      apiaries: apiaries.rows[0],
      hives: hives.rows[0],
      queens: queens.rows[0],
      treatments: treatments.rows[0],
      disease_outbreaks: outbreaks.rows[0],
      harvest_total_kg: harvests.rows[0].total_kg,
      pollination: contracts.rows[0],
      varroa: varroa.rows[0],
      ...(req.body?.notes ? { notes: req.body.notes } : {}),
    };
    const result = await ai.executiveBrief(snapshot);
    const out = { snapshot, brief: result };
    await record('executive-brief', { notes: req.body?.notes || null }, out);
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7. harvest-forecast
router.post('/harvest-forecast', async (req, res) => {
  try {
    const input = req.body || {};
    const r = await pool.query('SELECT * FROM honey_harvests ORDER BY harvested_at DESC LIMIT 30');
    input.recent_harvests = r.rows;
    const result = await ai.harvestForecast(input);
    await record('harvest-forecast', { horizon_weeks: input.horizon_weeks, type: input.type }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8. treatment-efficacy-analyze
router.post('/treatment-efficacy-analyze', async (req, res) => {
  try {
    const input = req.body || {};
    const where = input.product ? 'WHERE product ILIKE $1' : '';
    const params = input.product ? [`%${input.product}%`] : [];
    const t = await pool.query(`SELECT * FROM treatments ${where} ORDER BY applied_at DESC LIMIT 50`, params);
    const v = await pool.query('SELECT * FROM varroa_counts ORDER BY sampled_at DESC LIMIT 50');
    input.treatments = t.rows;
    input.varroa_counts = v.rows;
    const result = await ai.treatmentEfficacyAnalyze(input);
    await record('treatment-efficacy-analyze', { product: input.product }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9. customer-quote
router.post('/customer-quote', runAi('customer-quote', ai.customerQuote));

// 10. weather-impact-brief
router.post('/weather-impact-brief', async (req, res) => {
  try {
    const input = req.body || {};
    if (input.location) {
      const r = await pool.query('SELECT * FROM weather_briefs WHERE location ILIKE $1 ORDER BY valid_at DESC LIMIT 5', [`%${input.location}%`]);
      input.recent_weather = r.rows;
    }
    const result = await ai.weatherImpactBrief(input);
    await record('weather-impact-brief', input, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11. disease-outbreak-summary
router.post('/disease-outbreak-summary', async (req, res) => {
  try {
    const input = req.body || {};
    if (input.outbreak_id) {
      const r = await pool.query('SELECT * FROM disease_outbreaks WHERE outbreak_id = $1 LIMIT 1', [input.outbreak_id]);
      input.outbreak = r.rows[0];
    } else {
      const r = await pool.query("SELECT * FROM disease_outbreaks WHERE status='open' ORDER BY opened_at DESC LIMIT 5");
      input.recent_open_outbreaks = r.rows;
    }
    const result = await ai.diseaseOutbreakSummary(input);
    await record('disease-outbreak-summary', { outbreak_id: input.outbreak_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12. supply-resupply-plan
router.post('/supply-resupply-plan', async (req, res) => {
  try {
    const input = req.body || {};
    const r = await pool.query('SELECT * FROM supplies ORDER BY id LIMIT 50');
    input.current_supplies = r.rows;
    const result = await ai.supplyResupplyPlan(input);
    await record('supply-resupply-plan', { focus: input.focus }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13. beekeeper-schedule
router.post('/beekeeper-schedule', async (req, res) => {
  try {
    const input = req.body || {};
    const [bk, ap] = await Promise.all([
      pool.query("SELECT * FROM beekeepers WHERE status='active' ORDER BY id LIMIT 20"),
      pool.query("SELECT * FROM apiaries WHERE status='active' ORDER BY id LIMIT 20"),
    ]);
    input.beekeepers = bk.rows;
    input.apiaries = ap.rows;
    const result = await ai.beekeeperSchedule(input);
    await record('beekeeper-schedule', { week_start: input.week_start, focus: input.focus }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14. plant-source-map
router.post('/plant-source-map', async (req, res) => {
  try {
    const input = req.body || {};
    const r = await pool.query('SELECT * FROM plant_sources ORDER BY distance_km ASC LIMIT 20');
    input.plant_sources = r.rows;
    if (input.apiary_id) {
      const a = await pool.query('SELECT * FROM apiaries WHERE apiary_id = $1 LIMIT 1', [input.apiary_id]);
      input.apiary = a.rows[0];
    }
    const result = await ai.plantSourceMap(input);
    await record('plant-source-map', { apiary_id: input.apiary_id }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15. equipment-prognostic
router.post('/equipment-prognostic', async (req, res) => {
  try {
    const input = req.body || {};
    const r = await pool.query('SELECT * FROM equipment ORDER BY last_service ASC LIMIT 30');
    input.equipment = r.rows;
    const result = await ai.equipmentPrognostic(input);
    await record('equipment-prognostic', { focus: input.focus }, result);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16. vendor-quote-compare
router.post('/vendor-quote-compare', runAi('vendor-quote-compare', ai.vendorQuoteCompare));

module.exports = router;
