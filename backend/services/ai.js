// AI helper service for AIBeekeepingApiary
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior apicultural / commercial beekeeping operations analyst supporting an apiary management center. ' +
  'You provide rigorous, field-grade reasoning on hive health, queen status, varroa management, pollination logistics, ' +
  'honey harvest forecasting, and disease response. Always return strict JSON in the exact schema requested.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3092',
        'X-Title': 'AI Beekeeping & Apiary',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ──────────────────────────────────────────────────────────────
// 1. Queen Status From Sound
// ──────────────────────────────────────────────────────────────
async function queenStatusFromSound(input = {}) {
  const sys = `${SYSTEM_PROMPT} Classify queen status from acoustic recording metadata. Return strict JSON:
{
  "hive_id": string,
  "classification": "queenright"|"queenless"|"queenless_warble"|"swarm_preparing"|"weak"|"unknown",
  "confidence": number,
  "indicators": [{ "name": string, "evidence": string, "weight": number }],
  "recommended_actions": [string],
  "urgency": "routine"|"urgent"|"critical",
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', indicators: [] });
}

// ──────────────────────────────────────────────────────────────
// 2. Varroa Treatment Recommend
// ──────────────────────────────────────────────────────────────
async function varroaTreatmentRecommend(input = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend a varroa treatment plan. Return strict JSON:
{
  "hive_id": string,
  "mite_load": number,
  "severity": "low"|"moderate"|"high"|"critical",
  "primary_treatment": { "product": string, "dosage": string, "duration_days": number, "rationale": string },
  "alternates": [{ "product": string, "rationale": string }],
  "follow_up_check_days": number,
  "cautions": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', alternates: [] });
}

// ──────────────────────────────────────────────────────────────
// 3. Swarm Risk Predict
// ──────────────────────────────────────────────────────────────
async function swarmRiskPredict(input = {}) {
  const sys = `${SYSTEM_PROMPT} Predict swarm risk per hive. Return strict JSON:
{
  "predictions": [{
    "hive_id": string,
    "swarm_risk_score": number,
    "window_days": number,
    "drivers": [string],
    "preventative_actions": [string]
  }],
  "yard_level_summary": string,
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', predictions: [] });
}

// ──────────────────────────────────────────────────────────────
// 4. Pollination Route Plan
// ──────────────────────────────────────────────────────────────
async function pollinationRoutePlan(input = {}) {
  const sys = `${SYSTEM_PROMPT} Plan a multi-stop pollination route. Return strict JSON:
{
  "route": [{ "stop_order": number, "customer": string, "crop": string, "hives_to_deliver": number, "eta": string }],
  "total_distance_km": number,
  "total_drive_hours": number,
  "loading_plan": [{ "yard": string, "hives": number, "notes": string }],
  "risks": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', route: [] });
}

// ──────────────────────────────────────────────────────────────
// 5. Hive Strength Trend
// ──────────────────────────────────────────────────────────────
async function hiveStrengthTrend(input = {}) {
  const sys = `${SYSTEM_PROMPT} Analyze hive strength trend across recent inspections. Return strict JSON:
{
  "hive_id": string,
  "current_strength": "weak"|"moderate"|"strong",
  "trend": "improving"|"stable"|"declining",
  "key_factors": [{ "factor": string, "impact": "positive"|"neutral"|"negative", "narrative": string }],
  "projected_state_30d": "weak"|"moderate"|"strong",
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', key_factors: [] });
}

// ──────────────────────────────────────────────────────────────
// 6. Executive Brief
// ──────────────────────────────────────────────────────────────
async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce an operations executive brief for an apiary business. Return strict JSON:
{
  "headline": string,
  "operational_picture": string,
  "colony_health": { "strong_percent": number, "moderate_percent": number, "weak_percent": number, "narrative": string },
  "key_risks": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_7d_outlook": string,
  "summary": string
}`;
  const usr = `Operational snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// ──────────────────────────────────────────────────────────────
// 7. Harvest Forecast
// ──────────────────────────────────────────────────────────────
async function harvestForecast(input = {}) {
  const sys = `${SYSTEM_PROMPT} Forecast honey harvest yield. Return strict JSON:
{
  "horizon_weeks": number,
  "forecast_per_hive_kg": [{ "hive_id": string, "expected_kg": number, "confidence": number }],
  "total_expected_kg": number,
  "drivers": [{ "driver": string, "impact": "positive"|"neutral"|"negative", "narrative": string }],
  "harvest_window_recommendation": { "start": string, "end": string, "rationale": string },
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', forecast_per_hive_kg: [] });
}

// ──────────────────────────────────────────────────────────────
// 8. Treatment Efficacy Analyze
// ──────────────────────────────────────────────────────────────
async function treatmentEfficacyAnalyze(input = {}) {
  const sys = `${SYSTEM_PROMPT} Analyze treatment efficacy. Return strict JSON:
{
  "treatments_evaluated": number,
  "efficacy_by_product": [{ "product": string, "trials": number, "avg_mite_drop_pct": number, "verdict": "effective"|"marginal"|"ineffective" }],
  "side_effects_observed": [string],
  "best_practice_recommendations": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', efficacy_by_product: [] });
}

// ──────────────────────────────────────────────────────────────
// 9. Customer Quote
// ──────────────────────────────────────────────────────────────
async function customerQuote(input = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a customer pollination quote. Return strict JSON:
{
  "customer": string,
  "crop": string,
  "hives_recommended": number,
  "fee_estimate_usd": number,
  "fee_breakdown": [{ "line": string, "amount_usd": number }],
  "service_window": { "start": string, "end": string },
  "terms": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', fee_breakdown: [] });
}

// ──────────────────────────────────────────────────────────────
// 10. Weather Impact Brief
// ──────────────────────────────────────────────────────────────
async function weatherImpactBrief(input = {}) {
  const sys = `${SYSTEM_PROMPT} Translate weather data into apiary operational impact. Return strict JSON:
{
  "location": string,
  "foraging_outlook": "poor"|"fair"|"good"|"excellent",
  "swarm_risk_change": "decreased"|"unchanged"|"elevated",
  "treatment_window_advice": string,
  "operational_actions": [string],
  "alerts": [{ "type": string, "severity": "low"|"medium"|"high", "narrative": string }],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', alerts: [] });
}

// ──────────────────────────────────────────────────────────────
// 11. Disease Outbreak Summary
// ──────────────────────────────────────────────────────────────
async function diseaseOutbreakSummary(input = {}) {
  const sys = `${SYSTEM_PROMPT} Summarize a disease outbreak and recommend a response. Return strict JSON:
{
  "outbreak_id": string,
  "disease": string,
  "affected_apiaries": [string],
  "severity": "low"|"medium"|"high"|"critical",
  "containment_steps": [string],
  "regulatory_reporting": [string],
  "follow_up_inspections_days": number,
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', containment_steps: [] });
}

// ──────────────────────────────────────────────────────────────
// 12. Supply Resupply Plan
// ──────────────────────────────────────────────────────────────
async function supplyResupplyPlan(input = {}) {
  const sys = `${SYSTEM_PROMPT} Build a resupply plan from current supplies + reorder points. Return strict JSON:
{
  "reorder_recommendations": [{ "item": string, "current_qty": number, "reorder_point": number, "suggested_order_qty": number, "rationale": string }],
  "estimated_total_cost_usd": number,
  "preferred_vendors": [string],
  "lead_time_warnings": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', reorder_recommendations: [] });
}

// ──────────────────────────────────────────────────────────────
// 13. Beekeeper Schedule
// ──────────────────────────────────────────────────────────────
async function beekeeperSchedule(input = {}) {
  const sys = `${SYSTEM_PROMPT} Build a 1-week beekeeper work schedule across yards. Return strict JSON:
{
  "schedule": [{ "day": string, "beekeeper": string, "apiary": string, "tasks": [string], "est_hours": number }],
  "total_hours": number,
  "unstaffed_gaps": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', schedule: [] });
}

// ──────────────────────────────────────────────────────────────
// 14. Plant Source Map
// ──────────────────────────────────────────────────────────────
async function plantSourceMap(input = {}) {
  const sys = `${SYSTEM_PROMPT} Map nearby nectar/pollen sources to current foraging strategy. Return strict JSON:
{
  "apiary": string,
  "ranked_sources": [{ "source": string, "distance_km": number, "yield": string, "blooms_at": string, "priority": "low"|"medium"|"high" }],
  "diversity_score": number,
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', ranked_sources: [] });
}

// ──────────────────────────────────────────────────────────────
// 15. Equipment Prognostic
// ──────────────────────────────────────────────────────────────
async function equipmentPrognostic(input = {}) {
  const sys = `${SYSTEM_PROMPT} Predict equipment service needs. Return strict JSON:
{
  "predictions": [{
    "eq_id": string,
    "type": string,
    "predicted_failure_window_days": number,
    "component_at_risk": string,
    "recommended_service": string,
    "urgency": "routine"|"urgent"|"critical"
  }],
  "recommended_spares_to_stock": [string],
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', predictions: [] });
}

// ──────────────────────────────────────────────────────────────
// 16. Vendor Quote Compare
// ──────────────────────────────────────────────────────────────
async function vendorQuoteCompare(input = {}) {
  const sys = `${SYSTEM_PROMPT} Compare vendor quotes for an apiary supply item. Return strict JSON:
{
  "item": string,
  "winning_vendor": string,
  "ranking": [{ "vendor": string, "unit_price_usd": number, "lead_time_days": number, "rating": number, "rationale": string }],
  "savings_vs_baseline_usd": number,
  "summary": string
}`;
  const usr = `Input:\n${JSON.stringify(input, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', ranking: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  queenStatusFromSound,
  varroaTreatmentRecommend,
  swarmRiskPredict,
  pollinationRoutePlan,
  hiveStrengthTrend,
  executiveBrief,
  harvestForecast,
  treatmentEfficacyAnalyze,
  customerQuote,
  weatherImpactBrief,
  diseaseOutbreakSummary,
  supplyResupplyPlan,
  beekeeperSchedule,
  plantSourceMap,
  equipmentPrognostic,
  vendorQuoteCompare,
};
