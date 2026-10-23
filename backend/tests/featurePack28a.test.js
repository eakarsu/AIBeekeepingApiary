'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const { FEATURES, runFeaturePackAi } = require('../lib/featurePack28a');
test('28A features are domain-grounded (2-3)', () => { assert.ok(Object.keys(FEATURES).length >= 2 && Object.keys(FEATURES).length <= 3); });
test('deterministic fallback preserves 0/false/empty without provider', async () => {
  let called = false;
  const out = await runFeaturePackAi('varroa-risk-summary', [{ hive_id: 'H-1', mites_per_100_bees: 0 }], {}, async () => { called = true; throw new Error('must not call'); });
  assert.equal(called, false); assert.equal(out.aiGenerated, false); assert.equal(out.metrics.max_mites_per_100_bees, 0); assert.equal(out.metrics.any_high_risk, false); assert.deepEqual(out.high_risk_hive_ids, []);
});
test('fallback flags high varroa and unknown feature is null', async () => {
  const out = await runFeaturePackAi('varroa-risk-summary', [{ hive_id: 'H-2', mites_per_100_bees: 4.5 }], {}, global.fetch);
  assert.equal(out.metrics.high_risk_count, 1); assert.equal(out.metrics.any_high_risk, true);
  assert.equal(await runFeaturePackAi('nope', [], {}, global.fetch), null);
});
