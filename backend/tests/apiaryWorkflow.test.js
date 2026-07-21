const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInspection, buildApiaryDraft } = require('../domain/apiaryWorkflow');

test('high mite count creates traceable review tasks without prescribing treatment', () => {
  const input = { hive_id: 'H-1', source_event_id: 'offline-8', inspected_at: '2026-07-18T12:00:00Z', provenance: { source: 'manual-inspection', offline: true }, findings: { varroa_mites_per_100_bees: 5.4, queen_seen: false, disease_signs: [] } };
  assert.deepEqual(validateInspection(input), []);
  const draft = buildApiaryDraft(input);
  assert.equal(draft.requires_beekeeper_approval, true);
  assert.equal(draft.automatic_treatment, false);
  assert.equal(draft.treatment_product_or_dose, null);
  assert.ok(draft.tasks.some((task) => task.type === 'REVIEW_LABEL_AND_LOCAL_RULES'));
});

test('apiary workflow rejects untraceable inspections', () => {
  assert.ok(validateInspection({ findings: {} }).length >= 5);
});
