// Genetic resilience tracker.
// NEEDS-PRODUCT-DECISION resolved with a published-trait baseline:
//   resistance_rating bands:
//     vsh + hygienic averaged
//     >= 80 → resistant
//     >= 60 → tolerant
//     >= 40 → susceptible
//     <  40 → vulnerable
//   varroa_load_post < 2 mites/100 bees pulls rating up one tier.

const express = require('express');
const buildCrud = require('./_crudFactory');
const pool = require('../config/database');

const innerCrud = buildCrud({
  table: 'genetic_resilience_records',
  fields: [
    'record_id',
    'queen_id',
    'line_name',
    'vsh_score',
    'hygienic_score',
    'varroa_load_post',
    'resistance_rating',
    'assessed_at',
    'notes',
  ],
});

function band(avg) {
  if (avg >= 80) return 'resistant';
  if (avg >= 60) return 'tolerant';
  if (avg >= 40) return 'susceptible';
  return 'vulnerable';
}
const TIERS = ['vulnerable', 'susceptible', 'tolerant', 'resistant'];

const outer = express.Router();

outer.get('/score/:queen_id', async (req, res) => {
  try {
    const qid = req.params.queen_id;
    const r = await pool.query(
      'SELECT * FROM genetic_resilience_records WHERE queen_id = $1 ORDER BY assessed_at DESC LIMIT 1',
      [qid]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'no record for queen_id' });
    const row = r.rows[0];
    const vsh = Number(row.vsh_score || 0);
    const hyg = Number(row.hygienic_score || 0);
    const avg = (vsh + hyg) / 2;
    let tier = band(avg);
    if (row.varroa_load_post != null && Number(row.varroa_load_post) < 2) {
      const idx = TIERS.indexOf(tier);
      if (idx >= 0 && idx < TIERS.length - 1) tier = TIERS[idx + 1];
    }
    res.json({
      queen_id: qid,
      line_name: row.line_name,
      vsh_score: vsh,
      hygienic_score: hyg,
      avg_trait_score: +avg.toFixed(2),
      varroa_load_post: row.varroa_load_post,
      resistance_rating: tier,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

outer.use(innerCrud);

module.exports = outer;
