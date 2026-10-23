'use strict';
// Wave 28A domain AI over this app's own records. Provider is called only when
// OPENROUTER_API_KEY or OPENAI_API_KEY is configured; otherwise a clearly
// labelled deterministic fallback is returned (aiGenerated:false).
const { providerConfigured } = require('./featurePack27b');

const FEATURES = {
  'colony-health-summary': function colonyHealthSummary(hives) {
    const rows = Array.isArray(hives) ? hives : [];
    const byStatus = {}; let frames = 0; const weak = [];
    for (const h of rows) { const s = String(h.status ?? 'unknown'); byStatus[s] = (byStatus[s] || 0) + 1; frames += Number(h.frame_count) || 0; if (['weak', 'queenless', 'dead'].includes(s)) weak.push(h.hive_id ?? h.id ?? null); }
    return { feature: 'colony-health-summary', aiGenerated: false, source: 'deterministic-fallback', note: 'No AI provider result — computed deterministically from hive records.', summary: `${rows.length} hive(s) reviewed; ${weak.length} weak, queenless or dead.`, metrics: { total_hives: rows.length, average_frame_count: rows.length ? Math.round((frames / rows.length) * 100) / 100 : 0, weak_or_queenless_count: weak.length, all_strong: weak.length === 0 && rows.length > 0 }, by_status: byStatus, weak_hive_ids: weak };
  },
  'varroa-risk-summary': function varroaRiskSummary(counts) {
    const rows = Array.isArray(counts) ? counts : [];
    const vals = rows.map((r) => Number(r.mites_per_100_bees)).filter(Number.isFinite);
    const high = rows.filter((r) => Number(r.mites_per_100_bees) >= 3).map((r) => r.hive_id ?? null);
    return { feature: 'varroa-risk-summary', aiGenerated: false, source: 'deterministic-fallback', note: 'No AI provider result — 3 mites/100 bees action threshold applied deterministically; follow local label and veterinary guidance.', summary: `${high.length} of ${rows.length} count(s) at or above threshold.`, metrics: { count_records: rows.length, high_risk_count: high.length, max_mites_per_100_bees: vals.length ? Math.max(...vals) : 0, average_mites_per_100_bees: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0, any_high_risk: high.length > 0 }, high_risk_hive_ids: high };
  },
  'harvest-readiness': function harvestReadiness(input) {
    const harvests = Array.isArray(input) ? input : (input.harvests || []);
    const hives = Array.isArray(input) ? [] : (input.hives || []);
    let kg = 0; const harvested = new Set();
    for (const h of harvests) { kg += Number(h.kg) || 0; if (h.hive_id != null) harvested.add(String(h.hive_id)); }
    return { feature: 'harvest-readiness', aiGenerated: false, source: 'deterministic-fallback', note: 'No AI provider result — totals computed deterministically from harvest and hive records.', summary: `${Math.round(kg * 100) / 100} kg recorded across ${harvests.length} harvest(s).`, metrics: { harvest_count: harvests.length, total_kg: Math.round(kg * 100) / 100, hives_with_harvest_count: harvested.size, hives_without_harvest_count: Math.max(0, hives.length - harvested.size), has_harvests: harvests.length > 0 }, harvested_hive_ids: [...harvested] };
  },
};

async function maybeCallProvider(feature, records, env, fetchImpl) {
  if (!providerConfigured(env)) return null;
  const isOpenRouter = Boolean(env.OPENROUTER_API_KEY);
  const url = isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const model = env.OPENROUTER_MODEL || env.OPENAI_MODEL || (isOpenRouter ? 'anthropic/claude-haiku-4.5' : 'gpt-4o-mini');
  const resp = await fetchImpl(url, { method: 'POST', headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY || env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'system', content: 'Return valid JSON only with labelled sections preserving numbers, booleans and empty values exactly. Use only the supplied records.' }, { role: 'user', content: `Feature ${feature}. Analyse these records: ${JSON.stringify(records).slice(0, 6000)}` }], temperature: 0.2 }) });
  if (!resp.ok) throw new Error('provider failed');
  const data = await resp.json(); const text = data.choices?.[0]?.message?.content || '';
  try { return { provider: isOpenRouter ? 'openrouter' : 'openai', model, data: JSON.parse(text.replace(/```json|```/g, '').trim()) }; } catch { return { provider: isOpenRouter ? 'openrouter' : 'openai', model, data: { summary: text } }; }
}

async function runFeaturePackAi(feature, records, env = process.env, fetchImpl = global.fetch) {
  const fn = FEATURES[feature];
  if (!fn) return null;
  try {
    const p = await maybeCallProvider(feature, records || [], env, fetchImpl);
    if (p) return { feature, aiGenerated: true, source: 'provider', provider: p.provider, model: p.model, result: p.data };
  } catch (e) {
    return { ...fn(records || []), providerError: `Provider call failed: ${e.message}` };
  }
  return fn(records || []);
}
module.exports = { FEATURES, runFeaturePackAi, providerConfigured };
