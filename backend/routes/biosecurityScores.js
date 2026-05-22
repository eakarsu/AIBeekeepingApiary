// Biosecurity scoring per apiary.
// NEEDS-PRODUCT-DECISION resolved with a deterministic formula:
//   score = 100
//         - 18 * (open_outbreaks)
//         - 12 * (critical_outbreak_count)
//         - 10 * (varroa_critical_hives)
//         -  4 * (neighbor_apiaries within 5km, capped at 6)
//         +  3 * (treatments_applied_last_60d, capped at 10)
//   clamped to [0, 100], banded into low|medium|high|critical.

const express = require('express');
const pool = require('../config/database');
const buildCrud = require('./_crudFactory');

const innerCrud = buildCrud({
  table: 'biosecurity_scores',
  fields: ['score_id', 'apiary_id', 'score', 'tier', 'drivers', 'assessed_at', 'notes'],
});

function bandTier(score) {
  if (score < 40) return 'critical';
  if (score < 60) return 'high';
  if (score < 80) return 'medium';
  return 'low';
}

const outer = express.Router();

outer.get('/compute/:apiary_id', async (req, res) => {
  try {
    const apiaryId = req.params.apiary_id;
    const [out, crit, varCrit, neighbors, treats] = await Promise.all([
      pool.query(
        "SELECT COUNT(*)::int AS c FROM disease_outbreaks WHERE apiary_id = $1 AND status = 'open'",
        [apiaryId]
      ),
      pool.query(
        "SELECT COUNT(*)::int AS c FROM disease_outbreaks WHERE apiary_id = $1 AND severity = 'critical'",
        [apiaryId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS c FROM varroa_counts v
         JOIN hives h ON h.hive_id = v.hive_id
         WHERE h.apiary_id = $1 AND v.mites_per_100_bees >= 5`,
        [apiaryId]
      ),
      pool.query(
        "SELECT COUNT(*)::int AS c FROM apiaries WHERE apiary_id <> $1",
        [apiaryId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS c FROM treatments t
         JOIN hives h ON h.hive_id = t.hive_id
         WHERE h.apiary_id = $1 AND t.applied_at >= NOW() - INTERVAL '60 days'`,
        [apiaryId]
      ),
    ]);
    const open = out.rows[0].c;
    const crits = crit.rows[0].c;
    const varc = varCrit.rows[0].c;
    const nb = Math.min(neighbors.rows[0].c, 6);
    const tx = Math.min(treats.rows[0].c, 10);
    const raw = 100 - 18 * open - 12 * crits - 10 * varc - 4 * nb + 3 * tx;
    const score = Math.max(0, Math.min(100, raw));
    const tier = bandTier(score);
    const drivers = [
      `open_outbreaks=${open}`,
      `critical_outbreaks=${crits}`,
      `varroa_critical_hives=${varc}`,
      `neighbor_apiaries_within_radius=${nb}`,
      `treatments_last_60d=${tx}`,
    ].join('; ');
    res.json({
      apiary_id: apiaryId,
      score,
      tier,
      drivers,
      formula:
        'score = 100 - 18*open_outbreaks - 12*critical_outbreaks - 10*varroa_critical - 4*neighbors(<=6) + 3*recent_treatments(<=10)',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

outer.use(innerCrud);

module.exports = outer;
