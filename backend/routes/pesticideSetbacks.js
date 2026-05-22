// Pesticide setback compliance.
// EPA Bee Where? baseline setback distances (NEEDS-PRODUCT-DECISION resolved
// with reasonable defaults — EPA bee-toxicity label classes):
//   low           → 0 m (general signal-word products, no bee restriction)
//   moderate      → 30 m (label foraging buffer for moderately toxic products)
//   high          → 100 m (high-toxicity products w/ residual)
//   highly_toxic  → 500 m (acutely toxic; e.g. neonicotinoids during bloom)
// Compliance is evaluated as actual >= required. Caller may override required.

const express = require('express');
const buildCrud = require('./_crudFactory');
const pool = require('../config/database');

const EPA_BASELINE_SETBACKS_M = {
  low: 0,
  moderate: 30,
  high: 100,
  highly_toxic: 500,
};

const innerCrud = buildCrud({
  table: 'pesticide_setbacks',
  fields: [
    'setback_id',
    'apiary_id',
    'pesticide',
    'toxicity_class',
    'required_setback_m',
    'actual_setback_m',
    'status',
    'source_authority',
    'notes',
  ],
});

const outer = express.Router();

// Baseline reference (read-only).
outer.get('/baseline', (req, res) => {
  res.json({
    source: 'EPA pesticide bee-toxicity label classes',
    baseline_setbacks_m: EPA_BASELINE_SETBACKS_M,
    note: 'Use these as a default when required_setback_m is null.',
  });
});

// Compliance evaluation for a row.
outer.get('/:id/compliance', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pesticide_setbacks WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'not found' });
    const row = r.rows[0];
    const cls = String(row.toxicity_class || 'moderate').toLowerCase();
    const required =
      row.required_setback_m != null
        ? Number(row.required_setback_m)
        : (EPA_BASELINE_SETBACKS_M[cls] ?? 30);
    const actual = row.actual_setback_m != null ? Number(row.actual_setback_m) : null;
    const compliant = actual != null && actual >= required;
    res.json({
      id: row.id,
      apiary_id: row.apiary_id,
      pesticide: row.pesticide,
      toxicity_class: cls,
      required_setback_m: required,
      actual_setback_m: actual,
      compliant,
      gap_m: actual != null ? actual - required : null,
      source_authority: row.source_authority || 'EPA',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

outer.use(innerCrud);

module.exports = outer;
