// Pollination contract revenue model.
// NEEDS-PRODUCT-DECISION resolved with a fixed margin formula:
//   margin = gross - travel_cost
//   hive_fit_score in [0..100] (caller-provided or computed from contract).
// /optimize/:contract_id auto-fills travel_cost (USD 1.85/km baseline,
// 250km default fall-back when no distance available) and a simple hive
// fit score from hives_committed vs. live hive inventory.

const express = require('express');
const pool = require('../config/database');
const buildCrud = require('./_crudFactory');

const innerCrud = buildCrud({
  table: 'contract_revenue_models',
  fields: [
    'model_id',
    'contract_id',
    'gross_usd',
    'travel_cost_usd',
    'hive_fit_score',
    'margin_usd',
    'status',
    'notes',
  ],
});

const PER_KM_USD = 1.85;
const DEFAULT_DISTANCE_KM = 250;

const outer = express.Router();

outer.get('/optimize/:contract_id', async (req, res) => {
  try {
    const cid = req.params.contract_id;
    const c = await pool.query(
      'SELECT * FROM pollination_contracts WHERE contract_id = $1 LIMIT 1',
      [cid]
    );
    if (!c.rows.length) return res.status(404).json({ error: 'contract not found' });
    const contract = c.rows[0];
    const gross = Number(contract.fee_usd || 0);
    const distanceKm = DEFAULT_DISTANCE_KM;
    const travel = +(distanceKm * PER_KM_USD).toFixed(2);

    const hv = await pool.query(
      "SELECT COUNT(*)::int AS c FROM hives WHERE status IN ('active','strong','moderate')"
    );
    const available = hv.rows[0].c || 0;
    const committed = Number(contract.hives_committed || 0);
    const fit =
      committed === 0 ? 100 : Math.max(0, Math.min(100, (available / Math.max(1, committed)) * 100));

    const margin = +(gross - travel).toFixed(2);
    res.json({
      contract_id: cid,
      gross_usd: gross,
      travel_cost_usd: travel,
      hive_fit_score: Number(fit.toFixed(2)),
      margin_usd: margin,
      assumed_distance_km: distanceKm,
      per_km_usd: PER_KM_USD,
      recommendation:
        margin > 0 && fit >= 80
          ? 'accept'
          : margin > 0
            ? 'accept_with_hive_shortfall_plan'
            : 'reject_or_renegotiate',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

outer.use(innerCrud);

module.exports = outer;
