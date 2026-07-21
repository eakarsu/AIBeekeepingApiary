'use strict';

const RULESET_VERSION = 'apiary-inspection-triage-2026-07-18';

function validateInspection(input = {}) {
  const errors = [];
  if (typeof input.hive_id !== 'string' || !input.hive_id.trim()) errors.push('hive_id is required');
  if (typeof input.source_event_id !== 'string' || !input.source_event_id.trim()) errors.push('source_event_id is required');
  if (!input.inspected_at || Number.isNaN(Date.parse(input.inspected_at))) errors.push('inspected_at must be an ISO timestamp');
  if (!input.provenance || typeof input.provenance.source !== 'string') errors.push('provenance.source is required');
  const mites = Number(input.findings?.varroa_mites_per_100_bees);
  if (!Number.isFinite(mites) || mites < 0 || mites > 100) errors.push('findings.varroa_mites_per_100_bees must be between 0 and 100');
  if (input.findings?.disease_signs && !Array.isArray(input.findings.disease_signs)) errors.push('findings.disease_signs must be an array');
  return errors;
}

function buildApiaryDraft(input) {
  const findings = input.findings;
  const mites = Number(findings.varroa_mites_per_100_bees);
  const alerts = [];
  const tasks = [];
  if (mites >= 3) {
    alerts.push({ code: 'VARROA_REVIEW', severity: mites >= 5 ? 'critical' : 'high', evidence: { varroa_mites_per_100_bees: mites } });
    tasks.push({ type: 'REVIEW_LABEL_AND_LOCAL_RULES', priority: mites >= 5 ? 'urgent' : 'high' });
    tasks.push({ type: 'SCHEDULE_CONFIRMATORY_COUNT', priority: 'high' });
  }
  if (findings.queen_seen === false) tasks.push({ type: 'VERIFY_QUEEN_STATUS', priority: 'high' });
  if ((findings.disease_signs || []).length) {
    alerts.push({ code: 'DISEASE_SIGNS_REVIEW', severity: 'critical', evidence: { disease_signs: findings.disease_signs } });
    tasks.push({ type: 'ISOLATE_AND_REQUEST_QUALIFIED_REVIEW', priority: 'urgent' });
  }
  if (!tasks.length) tasks.push({ type: 'ROUTINE_FOLLOW_UP', priority: 'normal' });
  return {
    ruleset_version: RULESET_VERSION,
    status: 'draft',
    alerts,
    tasks,
    requires_beekeeper_approval: true,
    automatic_treatment: false,
    treatment_product_or_dose: null,
    provenance: input.provenance,
  };
}

module.exports = { RULESET_VERSION, validateInspection, buildApiaryDraft };
