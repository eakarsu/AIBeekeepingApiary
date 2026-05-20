const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [
      apiaries, hives, queens, inspections, treatments, harvests,
      supplies, equipment, beekeepers, contracts, customers, plants,
      weather, outbreaks, swarms, varroa, sounds, audit,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM apiaries"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='strong') AS strong, COUNT(*) FILTER (WHERE status='moderate') AS moderate, COUNT(*) FILTER (WHERE status='weak') AS weak FROM hives"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='laying') AS laying, COUNT(*) FILTER (WHERE status='failing') AS failing FROM queens"),
      pool.query("SELECT COUNT(*) AS total FROM inspections"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='applied') AS applied, COUNT(*) FILTER (WHERE status='scheduled') AS scheduled FROM treatments"),
      pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(kg),0) AS total_kg FROM honey_harvests"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='reorder') AS reorder FROM supplies"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='operational') AS operational, COUNT(*) FILTER (WHERE status='needs_service') AS needs_service FROM equipment"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM beekeepers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active, COALESCE(SUM(fee_usd),0) AS total_fee FROM pollination_contracts"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='active') AS active FROM customers"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='available') AS available FROM plant_sources"),
      pool.query("SELECT COUNT(*) AS total FROM weather_briefs"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE severity='critical') AS critical, COUNT(*) FILTER (WHERE status='open') AS open FROM disease_outbreaks"),
      pool.query("SELECT COUNT(*) AS total FROM swarms"),
      pool.query("SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status='critical') AS critical FROM varroa_counts"),
      pool.query("SELECT COUNT(*) AS total FROM hive_sounds"),
      pool.query("SELECT COUNT(*) AS total FROM audit_log"),
    ]);
    res.json({
      apiaries: apiaries.rows[0],
      hives: hives.rows[0],
      queens: queens.rows[0],
      inspections: inspections.rows[0],
      treatments: treatments.rows[0],
      honey_harvests: harvests.rows[0],
      supplies: supplies.rows[0],
      equipment: equipment.rows[0],
      beekeepers: beekeepers.rows[0],
      pollination_contracts: contracts.rows[0],
      customers: customers.rows[0],
      plant_sources: plants.rows[0],
      weather_briefs: weather.rows[0],
      disease_outbreaks: outbreaks.rows[0],
      swarms: swarms.rows[0],
      varroa_counts: varroa.rows[0],
      hive_sounds: sounds.rows[0],
      audit_log: audit.rows[0],
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
